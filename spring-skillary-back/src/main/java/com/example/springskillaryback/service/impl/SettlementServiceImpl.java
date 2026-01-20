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
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt")
		                                                   .descending());
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
		if (!user.hasRole(RoleEnum.ROLE_ADMIN))
			throw new IllegalArgumentException("사용 권한이 없습니다.");
		Pageable pageable = PageRequest.of(page, size, Sort.by("periodStart")
		                                                   .descending());
		return settlementRunRepository.findAll(pageable);
	}

	// @Scheduled(cron = "0 0 0 * * *") // 실제 운영: 매일 오전 0시
	@Scheduled(fixedDelay = 60000)      // 테스트용: 1분마다 실행하여 로직 확인
	@Transactional
	public void dailySettlementProcess() {
		LocalDate today = LocalDate.now();
		int dayOfMonth = today.getDayOfMonth();

		log.info("======= [통합 정산 프로세스 시작 - 날짜: {}] =======", today);

		if (!settlementRunRepository.existsByCurrentDateWithinPeriod()) {
			init();
		} else {
			log.info("[SKIP] 이미 오늘 분에 대한 정산 그릇이 있으므로 건너뜁니다.");
		}

		// 2. 매일 실행: 어제 결제 데이터 수집 (fetch)
		// 주의: 1일에 init이 실행된 직후라면 새 그릇에 데이터가 바로 쌓임
		fetch();

		// 3. 매월 10일인 경우: 정산 확정 처리 (runSettlement)
		if (dayOfMonth == 10) {
			runSettlement();
		} else {
			log.info("[SKIP] 오늘은 10일이 아니므로 runSettlement를 건너뜁니다.");
		}

		log.info("======= [통합 정산 프로세스 종료] =======");
	}

	private void init() {
		log.info("========== [STEP 1] 정산 초기화 시작 (init) ==========");

		YearMonth currentMonth = YearMonth.now(); // 이번 달로 변경
		LocalDate start = currentMonth.atDay(1);
		LocalDate end = currentMonth.atEndOfMonth();

		// 기존에 생성된게 있는지 체크하는 로직이 있으면 좋지만, 테스트용이므로 생성로그만 남깁니다.
		var run = settlementRunRepository.save(new SettlementRun(start, end));
		log.info("▶ SettlementRun 생성 완료 | 기간: {} ~ {} | ID: {}", start, end, run.getRunId());

		List<Creator> creators = creatorRepository.findAll();
		var lst = new ArrayList<CreatorSettlement>();
		for (Creator creator : creators) {
			lst.add(new CreatorSettlement(creator, run));
		}
		creatorSettlementRepository.saveAll(lst);

		log.info("▶ 크리에이터 정산 레코드 생성 완료 (대상: {}명)", lst.size());
		log.info("========== [STEP 1] 초기화 종료 ==========");
	}

	private void fetch() {
		log.info("---------- [STEP 2] 결제 데이터 수집 시작 (fetch) ----------");

		LocalDate yesterday = LocalDate.now()
		                               .minusDays(1);
		LocalDateTime start = yesterday.atStartOfDay();
		LocalDateTime end = yesterday.atTime(LocalTime.MAX);

		List<Payment> payments = paymentRepository.findAllByCreditStatusAndCreatedAtBetween(
				CreditStatusEnum.PAID, start, end);
		var run = settlementRunRepository.findByCurrentDateWithinPeriod()
		                                 .orElseThrow(() -> new RuntimeException("[시스템 에러] 해당 기간의 settlement run 이 없습니다."));

		log.info("▶ 조회 날짜: {} | 수집된 결제 건수: {}건", yesterday, payments.size());

		for (Payment payment : payments) {
			int amount = payment.getCredit();
			int platformFee = (int) (amount * 0.3);
			int payoutAmount = amount - platformFee;

			var settlement = creatorSettlementRepository
					.findByCreatorAndSettlementRun(payment.getCreator(), run)
					.orElseGet(() -> {
						log.warn("⚠️ 정산 대상에 없는 크리에이터 발견(ID: {})", payment.getCreator().getCreatorId());
						log.info("⚠️ 1일에 생성 이후에 가입한 사용자들은 settlement 가 없을 수 있으므로 생성시켜줍니다.", payment.getCreator().getCreatorId());
						return creatorSettlementRepository.save(new CreatorSettlement(payment.getCreator(), run));
					});

			if (settlement != null) {
				settlement.update(amount, platformFee, payoutAmount);
				log.info("   - 업데이트 내역: [크리에이터: {}] [금액: {}] [수수료: {}]",
				         payment.getCreator()
				                .getDisplayName(), amount, platformFee);
			}
		}
		log.info("---------- [STEP 2] 데이터 수집 종료 ----------");
	}

	private void runSettlement() {
		log.info("########## [STEP 3] 정산 확정 시작 (run) ##########");

		YearMonth lastMonth = YearMonth.now()
		                               .minusMonths(1);
		LocalDate start = lastMonth.atDay(1);
		LocalDate end = lastMonth.atEndOfMonth();

		var run = settlementRunRepository.findByPeriodStartAndPeriodEnd(start, end)
		                                 .orElseThrow(() -> {
			                                 log.error("❌ 정산 실행 불가: 해당 기간({})의 SettlementRun 데이터가 없음", start);
			                                 return new IllegalArgumentException("시스템 오류");
		                                 });

		run.running();
		log.info("▶ 정산 프로세스 가동 (Status: RUNNING)");

		for (CreatorSettlement cs : run.getSettlements()) {
			// 원천세 3.3% 계산 로직 검증 로그
			int originFee = cs.getPlatformFee();
			int income = (int) (originFee * (1 - 0.033));
			int tax = originFee - income;

			adminVirtualCredit.add(income);
			cs.complete();

			log.info("   - 확정 완료: [ID: {}] [플랫폼수수료: {}] -> [세후수익: {}] (세금: {})",
			         cs.getCreator()
			           .getCreatorId(), originFee, income, tax);
		}

		run.complete();
		log.info("▶ 정산 상태 종료 (Status: COMPLETED)");
		log.info("########## [STEP 3] 정산 확정 전체 완료 ##########");
	}

	private User findUserOrElseThrow(byte userId) {
		return userRepository.findById(userId)
		                     .orElseThrow(() -> new IllegalArgumentException("시스템에 없는 사용자입니다."));
	}
}