import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
// ❌ NOT compatible with Node 22 (do NOT use)
// import mongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";

export const applySecurity = (app) => {
  // Basic security headers
  app.use(helmet());

  // CORS (dev-friendly)
  app.use(
    cors({
      origin: "*",
      credentials: false,
    })
  );

  /**
   * ❌ DISABLED FOR NODE 22
   * These mutate req.query / req.body which are read-only in Node 22
   * Causes: "Cannot set property query of IncomingMessage"
   */
  // app.use(mongoSanitize());
  // app.use(xss());

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
};

// Stricter limiter for auth / payments / chat
export const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
