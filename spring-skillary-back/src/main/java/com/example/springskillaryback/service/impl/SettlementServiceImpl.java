package com.example.springskillaryback.service.impl;

import com.example.springskillaryback.common.util.AdminVirtualCredit;
import com.example.springskillaryback.domain.Creator;
import com.example.springskillaryback.domain.CreatorSettlement;
import com.example.springskillaryback.domain.CreditStatusEnum;
import com.example.springskillaryback.domain.Payment;
import com.example.springskillaryback.domain.RoleEnum;
import com.example.springskillaryback.domain.SettlementRun;
import com.example.springskillaryback.domain.User;
import com.example.springskillaryback.repository.CreatorRepository;
import com.example.springskillaryback.repository.CreatorSettlementRepository;
import com.example.springskillaryback.repository.PaymentRepository;
import com.example.springskillaryback.repository.SettlementRunRepository;
import com.example.springskillaryback.repository.UserRepository;
import com.example.springskillaryback.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {
	private final AdminVirtualCredit adminVirtualCredit;
	private final UserRepository userRepository;
	private final SettlementRunRepository settlementRunRepository;
	private final CreatorSettlementRepository creatorSettlementRepository;
	private final CreatorRepository creatorRepository;
	private final PaymentRepository paymentRepository;

	@Override
	@Transactional(readOnly = true)
	public Page<CreatorSettlement> pagingCreatorSettlements(byte userId, int page, int size) {
		Creator creator = findUserOrElseThrow(userId).getCreator();
		if (creator == null)
			throw new IllegalArgumentException("크리에이터 생성 이후에 사용 가능");
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return creatorSettlementRepository.findAllByCreator(creator, pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public CreatorSettlement retrieveCreatorSettlement(byte userId, byte settlementId) {
		Creator creator = findUserOrElseThrow(userId).getCreator();
		if (creator == null)
			throw new IllegalArgumentException("크리에이터 생성 이후에 사용 가능");
		return creatorSettlementRepository
				.findById(settlementId)
				.orElseThrow(() -> new IllegalArgumentException("시스템에 등록되어 있지 않습니다."));
	}

	@Override
	@Transactional(readOnly = true)
	public Page<SettlementRun> pagingSettlementRuns(byte userId, int page, int size) {
		User user = findUserOrElseThrow(userId);
		if (!user.getRoles().contains(RoleEnum.ROLE_ADMIN))
			throw new IllegalArgumentException("사용 권한이 없습니다.");
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
		return settlementRunRepository.findAll(pageable);
	}

	@Transactional
	@Scheduled(cron = "0 0 0 1 * *")
	public void init() {
		YearMonth lastMonth = YearMonth.now().minusMonths(1);
		LocalDate start = lastMonth.atDay(1);
		LocalDate end = lastMonth.atEndOfMonth();

		var run = settlementRunRepository.save(new SettlementRun(start, end));

		var lst = new ArrayList<CreatorSettlement>();
		for (Creator creator : creatorRepository.findAll())
			lst.add(new CreatorSettlement(creator, run));
		creatorSettlementRepository.saveAll(lst);
	}

	@Transactional
	@Scheduled(cron = "0 0 2 * * *")
	public void fetch() {
		// 어제 날짜 구하기
		LocalDate yesterday = LocalDate.now().minusDays(1);
		LocalDateTime start = yesterday.atStartOfDay();
		LocalDateTime end = yesterday.atTime(LocalTime.MAX);

		List<Payment> payments = paymentRepository.findAllByCreditStatusAndCreatedAtBetween(
				CreditStatusEnum.PAID, start, end);

		for (Payment payment : payments) {
			int amount = payment.getCredit();
			int platformFee = (int) (amount * 0.3);
			int payoutAmount = amount - platformFee;

			var settlement = creatorSettlementRepository.findByCreator(payment.getCreator())
					.orElseThrow(() -> new IllegalArgumentException("없는 사용자입니다."));
			settlement.update(amount, platformFee, payoutAmount);
		}
	}

	@Transactional
	@Scheduled(cron = "0 0 0 10 * *")
	public void run() {
		YearMonth lastMonth = YearMonth.now().minusMonths(1);
		LocalDate start = lastMonth.atDay(1);
		LocalDate end = lastMonth.atEndOfMonth();

		var run = settlementRunRepository.findByPeriodStartAndPeriodEnd(start, end)
				.orElseThrow(() -> new IllegalArgumentException("시스템 오류"));

		run.running();
		for (CreatorSettlement creatorSettlement : run.getSettlements()) {
			int income = (int) (creatorSettlement.getPlatformFee() * (1 - 0.033));
			int outcome = creatorSettlement.getPlatformFee() - income;
			adminVirtualCredit.add(income);
			creatorSettlement.complete();
		}
		run.complete();
	}

	private User findUserOrElseThrow(byte userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("시스템에 없는 사용자입니다."));
	}
}