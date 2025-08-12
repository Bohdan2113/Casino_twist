import User from "../models/User.js";

const symbols = [
  { letter: "🍒", reward: 10 },
  { letter: "🍋", reward: 20 },
  { letter: "🍊", reward: 30 },
  { letter: "🍉", reward: 40 },
];

const startGame = async (req, res) => {
  try {
    const bet = req.body.bet;
    const userId = req.userInfo.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Couldn't find user",
      });
    }

    if (bet > user.points) {
      return res.status(401).json({
        success: false,
        message: "You don`t have enough pounts",
      });
    }

    user.password = undefined;
    user.payout = bet;

    req.session.user = user;
    res.status(200).json({
      success: true,
      bet,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occcured while starting the game",
    });
  }
};
const getSymbols = async (req, res) => {
  try {
    const letters = symbols.map((item) => item.letter);

    res.status(200).json({
      success: true,
      data: letters,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occcured while fetching symbols",
    });
  }
};
const spinRoll = async (req, res) => {
  try {
    if (req.session.user.payout <= 0) {
      return res.status(400).json({
        success: false,
        message: "No credits left",
      });
    }

    const user = await User.findById(req.userInfo.userId);
    req.session.user.payout--;
    user.points--;

    let result = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    let hasToWin = false;
    if (user.points < 10 && Math.random() < 0.3) hasToWin = true;
    if (user.points < 5 && Math.random() < 0.5) hasToWin = true;
    if (user.points < 3 && Math.random() < 0.7) hasToWin = true;
    if (user.points < 1 && Math.random() < 0.9) hasToWin = true;

    if (user.alwaysWin || hasToWin) {
      result = result.map(() => result[0]);
    }

    const isWin =
      result[0].letter === result[1].letter &&
      result[1].letter === result[2].letter;
    let reward = 0;

    if (isWin) {
      reward = result[0].reward;

      if (!user.alwaysWin || !hasToWin) {
        let cheatChance = 0;
        if (user.points >= 40 && user.points <= 60) {
          cheatChance = 0.3;
        } else if (user.points > 60) {
          cheatChance = 0.6;
        }

        if (Math.random() < cheatChance) {
          while (
            result[0].letter === result[1].letter &&
            result[1].letter === result[2].letter
          ) {
            result = [
              symbols[Math.floor(Math.random() * symbols.length)],
              symbols[Math.floor(Math.random() * symbols.length)],
              symbols[Math.floor(Math.random() * symbols.length)],
            ];
          }
          reward = 0;
        }
      }
    }

    req.session.user.payout += reward;
    user.points += reward;
    await user.save();

    res.status(200).json({
      success: true,
      result: result.map((s) => s.letter),
      payout: req.session.user.payout,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured while spinning",
    });
  }
};
const cashOut = async (req, res) => {
  try {
    const payout = req.session.user.payout;
    req.session.destroy();

    res.json({
      success: true,
      message: `Cashed out ${payout} credits!`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured while cashing out",
    });
  }
};

export { getSymbols, spinRoll, cashOut, startGame };
