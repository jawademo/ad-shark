"""
Scoring engine for ad-shark.
Calculates investor score, XPS, accuracy, and persona assignments.
"""

from dataclasses import dataclass


@dataclass
class RoundInput:
    decision: str  # invest | pass
    investment_amount: int
    starting_balance: int
    outcome_multiplier: float


@dataclass
class SessionSummary:
    total_rounds: int
    correct_rounds: int
    total_profit: int
    biggest_win: int
    biggest_loss: int
    starting_balance: int
    ending_balance: int
    accuracy: float
    investor_score: int
    xp_earned: int
    shark_coins_earned: int


def calculate_round_profit(decision: str, investment: int, multiplier: float) -> int:
    """Calculate profit/loss for a single round."""
    if decision == "pass":
        return 0
    if decision == "invest":
        if multiplier > 0:
            return int(investment * multiplier) - investment
        else:
            return -investment
    # counter_offer: partial invest, same math for now
    if multiplier > 0:
        return int(investment * multiplier) - investment
    return -investment


def calculate_investor_score(
    total_profit: int,
    accuracy: float,
    biggest_win: int,
    risk_factor: float,
    streak_bonus: int,
) -> int:
    """
    Compute the Investor Score from components.

    Weights: Profit 40%, Accuracy 25%, Risk 15%, Big Win 10%, Streak 10%

    The formula normalizes each component to a 0-1000 range, applies weights,
    then scales to the final score space.
    """
    # Profit score: log-scale to avoid billion-dollar distortion
    if total_profit > 0:
        import math
        profit_score = min(1000, int(100 * math.log10(total_profit + 1)))
    else:
        profit_score = max(0, int(500 + total_profit / 100))  # negative profit drags down

    accuracy_score = int(accuracy * 1000)  # 0-1000
    risk_score = min(1000, int(risk_factor * 1000))
    big_win_score = min(1000, biggest_win // 100)
    streak_score = min(1000, streak_bonus * 100)

    raw = (
        profit_score * 0.40
        + accuracy_score * 0.25
        + risk_score * 0.15
        + big_win_score * 0.10
        + streak_score * 0.10
    )

    return int(raw)


def calculate_xp(
    rounds_completed: int,
    correct_count: int,
    streak: int,
    mode: str,
    mode_bonus: int = 0,
) -> int:
    """Compute XP earned for a session."""
    base = rounds_completed * 10
    correct_bonus = correct_count * 25
    streak_bonus = (streak // 5) * 100  # 100 XP per 5-streak block

    mode_multiplier = {
        "daily": 2.0,
        "head_to_head": 1.5,
        "streak": 1.2,
        "classic": 1.0,
        "speed": 1.1,
        "themed": 1.0,
    }

    raw = (base + correct_bonus + streak_bonus + mode_bonus) * mode_multiplier.get(mode, 1.0)
    return max(0, int(raw))


def calculate_shark_coins(xp_earned: int, mode: str) -> int:
    """Shark Coins earned from a session. Roughly 10% of XP."""
    base = xp_earned // 10
    if mode == "daily":
        base += 25  # bonus for daily
    return max(0, base)


def compute_risk_factor(decisions: list[RoundInput]) -> float:
    """Risk factor: 0.0 (conservative) to 1.0 (YOLO)."""
    invests = [d for d in decisions if d.decision == "invest"]
    if not invests:
        return 0.0

    avg_pct = sum(d.investment_amount / d.starting_balance for d in invests) / len(invests)
    return min(1.0, avg_pct * 2)  # scale so 50% avg = 1.0


def compute_accuracy(correct: int, total: int) -> float:
    """Accuracy as a fraction."""
    if total == 0:
        return 0.0
    return correct / total


def assign_persona(
    accuracy: float,
    risk_factor: float,
    total_rounds: int,
    humor_preference: float,  # 0-1, how often they pick absurd products
    pass_rate: float,  # how often they pass
) -> str:
    """Assign a persona based on playstyle heuristics."""
    if total_rounds < 10:
        return None  # Not enough data

    if pass_rate > 0.7:
        return "Ghost"
    if risk_factor > 0.7 and accuracy > 0.6:
        return "Chaos Capitalist"
    if risk_factor > 0.7 and accuracy < 0.4:
        return "Lucky Fish"
    if risk_factor < 0.2 and accuracy > 0.7:
        return "Safe Shark"
    if humor_preference > 0.6:
        return "Meme Lord"
    if accuracy > 0.75 and risk_factor < 0.3:
        return "Oracle"
    if accuracy > 0.65:
        return "Sharp Eye"
    if risk_factor > 0.5:
        return "Aggressive"
    if pass_rate < 0.2:
        return "Action Junkie"
    return "Balanced"


def assign_risk_profile(risk_factor: float) -> str:
    if risk_factor < 0.15:
        return "Conservative"
    if risk_factor < 0.35:
        return "Balanced"
    if risk_factor < 0.55:
        return "Aggressive"
    return "YOLO"


def summarize_session(
    rounds: list[RoundInput],
    starting_balance: int,
    mode: str = "classic",
    streak: int = 0,
    mode_bonus: int = 0,
) -> SessionSummary:
    """Compute full session summary from a list of round inputs."""
    total_rounds = len(rounds)
    correct_rounds = 0
    total_profit = 0
    biggest_win = 0
    biggest_loss = 0
    balance = starting_balance

    for r in rounds:
        profit = calculate_round_profit(r.decision, r.investment_amount, r.outcome_multiplier)
        total_profit += profit
        balance += profit

        if profit > 0:
            correct_rounds += 1
            if profit > biggest_win:
                biggest_win = profit
        elif profit < 0:
            if abs(profit) > biggest_loss:
                biggest_loss = abs(profit)

    accuracy = compute_accuracy(correct_rounds, total_rounds)
    risk_factor = compute_risk_factor(rounds)
    investor_score = calculate_investor_score(total_profit, accuracy, biggest_win, risk_factor, streak)
    xp = calculate_xp(total_rounds, correct_rounds, streak, mode, mode_bonus)
    sc = calculate_shark_coins(xp, mode)

    return SessionSummary(
        total_rounds=total_rounds,
        correct_rounds=correct_rounds,
        total_profit=total_profit,
        biggest_win=biggest_win,
        biggest_loss=biggest_loss,
        starting_balance=starting_balance,
        ending_balance=balance,
        accuracy=accuracy,
        investor_score=investor_score,
        xp_earned=xp,
        shark_coins_earned=sc,
    )
