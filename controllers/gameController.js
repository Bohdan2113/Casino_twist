import User from "../models/User.js";

// Символи і нагороди
const symbols = [
  { letter: "🍋", reward: 10 },
  { letter: "🍒", reward: 20 },
  { letter: "🍀", reward: 30 },
  { letter: "7", reward: 40 },
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
    user.points -= bet;
    await user.save();

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

    // Знімаємо 1 кредит перед грою
    req.session.user.payout--;

    // Генеруємо випадковий результат
    let result = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    // Перевірка виграшу
    const isWin =
      result[0].letter === result[1].letter &&
      result[1].letter === result[2].letter;
    let reward = 0;

    if (isWin) {
      reward = result[0].reward;

      // Логіка "читерства"
      const user = await User.findById(req.session.user._id);
      let cheatChance = 0;
      if (user.points >= 40 && user.points <= 60) {
        cheatChance = 0.3;
      } else if (user.points > 60) {
        cheatChance = 0.6;
      }

      if (Math.random() < cheatChance) {
        // Перегенеруємо результат на програш
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

    req.session.user.payout += reward;

    res.status(200).json({
      success: true,
      result: result.map((s) => s.letter),
      payout: req.session.user.payout,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Sme error occured while spinning",
    });
  }
};
const cashOut = async (req, res) => {
  try {
    const user = await User.findById(req.userInfo.userId);
    console.log(req.session.user);
    const payout = req.session.user.payout;
    req.session.destroy();

    user.payout = 0;
    user.points += payout;
    await user.save();

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
