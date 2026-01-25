import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

export const applySecurity = (app) => {
  // basic headers
  app.use(helmet());

  // CORS (for dev keep *; later set your frontend URL)
  app.use(
    cors({
      origin: "*",
      credentials: false,
    })
  );

  // prevent NoSQL injection
  app.use(mongoSanitize());

  // basic XSS protection
  app.use(xss());

  // global rate limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
};

// tighter limiter for auth/payment/chat endpoints
export const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
