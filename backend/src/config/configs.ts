import "./env.js"; // Ensure env vars are loaded

// Database Configuration
export const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "auth_system",
    dialect: "postgres",
    // SSL options for production
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
};

// Server Configuration
export const serverConfig = {
    port: parseInt(process.env.PORT || "5000"),
    nodeEnv: process.env.NODE_ENV || "development",
    backendUrl: process.env.BACKEND_URL || "http://localhost:5000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    productionUrl: process.env.PRODUCTION_URL,
};

// Auth Configuration
export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || "tempSecret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "tempRefreshSecret",
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
    passwordResetTokenExpiry: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || "3600"),
    emailVerificationTokenExpiry: parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "86400"),
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleClientIdIos: process.env.GOOGLE_CLIENT_ID_IOS,
    appleTeamId: process.env.APPLE_TEAM_ID,
    appleClientId: process.env.APPLE_CLIENT_ID,
    appleKeyId: process.env.APPLE_KEY_ID,
    applePrivateKey: process.env.APPLE_PRIVATE_KEY,
    appleRedirectUri: process.env.APPLE_REDIRECTURI,
};

// OpenAI Configuration
export const openaiConfig = {
    apiKey: process.env.OPENAI_API_KEY,
};

// Email Configuration
export const emailConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
};

// Pricing Configuration
export const pricingConfig = {
    monthlyPriceEtb: parseFloat(process.env.MONTHLY_PRICE_IN_ETB || "0"),
    quarterlyPriceEtb: parseFloat(process.env.QUARTERLY_PRICE_IN_ETB || "0"),
    annualPriceEtb: parseFloat(process.env.ANNUAL_PRICE_IN_ETB || "0"),
    semiannualPriceEtb: parseFloat(process.env.SEMIANNUAL_PRICE_IN_ETB || "0"),
    chapaSecretKey: process.env.CHAPA_SECRET_KEY,
    chapaSecretHash: process.env.CHAPA_SECRET_HASH,
};

// Game/App Specific Configuration
export const gameConfig = {
    socialScienceDeptId: process.env.SOCIAL_SCIENCE_DEPARTMENT_ID,
    naturalScienceDeptId: process.env.NATURAL_SCIENCE_DEPARTMENT_ID,
    grade9And10DeptId: process.env.GRADE_9_AND_10_DEPARTMENT_ID,
    referralIncentive: process.env.REFERRAL_INCENTIVE,
    coinEncryptionKey: process.env.COIN_ENCRIPTION_KEY,
    contestCoin: process.env.CONTEST_COIN,
    coinRate: process.env.COIN_RATE,
    baseRating: process.env.BASE_RATING,
    baseTimeBonus: process.env.BASE_TIME_BONUS,
    rateOfAdjustment: process.env.RATE_OF_ADJUSTMENT,
    deletedAvatar: process.env.DELETED_AVATAR,
    quizLimit: process.env.QUIZ_LIMIT,
    contestLimit: process.env.CONTEST_LIMIT,
    freeMocks: process.env.FREE_MOCKS,
    premiumCourse: process.env.PREMIUM_COURSE,
    maxChatUsage: Number(process.env.MAX_CHAT_USAGE) || 10,
};

const configs = {
    dbConfig,
    serverConfig,
    authConfig,
    openaiConfig,
    emailConfig,
    pricingConfig,
    gameConfig,
};

export default configs;
