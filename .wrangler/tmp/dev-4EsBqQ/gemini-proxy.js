var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// workers/gemini-proxy.ts
var gemini_proxy_default = {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/generate")) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }
    try {
      const payload = await request.json();
      const { userMessage = "", context = "" } = payload;
      if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured in Worker environment" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
      const systemInstruction = `You are the TrustBnB Guest Support Agent (version support-v1.0.0). 
Tone: Professional, calm, neutral. NO emojis. Use the user's language (EN/AL/IT).

CRITICAL RULES:
1. MANDATORY ESCALATION: Immediately escalate for refunds, disputes, legal complaints, account issues, GDPR requests, and sensitive data access. Use support email: support@trustbnb.uk (unless tenant provided).
2. GDPR & LEGAL: Do not process personal data or give legal advice. Do not interpret T&Cs. Escalate immediately using official templates.
3. IDENTITY: Always confirm Booking ID and email before discussing details.
4. LIMITATIONS: Never guess, never act as Admin/Superadmin, never promise refunds or discounts.
5. TENANT BRANDING: Adapt tone/name ONLY if tenant variables (tenant_name, tenant_support_email, tenant_tone) are provided in context. Otherwise, use TrustBnB defaults.

Official Greetings:
- EN: "Hello, I\u2019m the TrustBnB support assistant. I can help explain bookings, pricing, and platform rules. How can I assist you today?"
- AL: "P\xEBrsh\xEBndetje, jam asistenti i TrustBnB. Mund t\u2019ju ndihmoj t\xEB kuptoni rezervimet, \xE7mimet dhe rregullat e platform\xEBs. Si mund t\u2019ju ndihmoj?"
- IT: "Ciao, sono l\u2019assistente di supporto TrustBnB. Posso aiutarti a capire prenotazioni, prezzi e regole della piattaforma. Come posso aiutarti?"

Refer to the internal Rulebook (workers/SUPPORT_AGENT_RULES.md) for full protocol logic. Keep answers concise and actionable.`;
      const promptText = `${systemInstruction}

Context:
${context}

User:
${userMessage}`;
      const model = env.MODEL || "gemini-2.5-flash";
      const body = {
        // model endpoint includes model in the URL, but include here for clarity if needed
        model,
        // Common shapes: `prompt: { text: ... }` or `input: '...'`
        prompt: { text: promptText },
        input: promptText,
        temperature: 0.2,
        maxOutputTokens: 512
      };
      const EXTERNAL_API_URL = env.EXTERNAL_API_URL || `https://api.generative.google/v1/models/${model}:generateText`;
      const externalRes = await fetch(EXTERNAL_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      const contentType = externalRes.headers.get("content-type") || "";
      let responseBody = null;
      if (contentType.includes("application/json")) {
        responseBody = await externalRes.json();
      } else {
        const rawText = await externalRes.text();
        responseBody = { text: rawText };
      }
      const extractText = /* @__PURE__ */ __name((data) => {
        if (!data) return null;
        if (data?.candidates && data.candidates[0]) return data.candidates[0].output || data.candidates[0].content || data.candidates[0].text;
        if (data?.outputs && data.outputs[0]) {
          const first = data.outputs[0];
          if (first?.content) {
            for (const c of first.content) {
              if (typeof c === "string") return c;
              if (c?.type === "output_text" && c?.text) return c.text;
              if (c?.text) return c.text;
            }
          }
        }
        if (data?.text) return data.text;
        if (data?.output) return data.output;
        return JSON.stringify(data);
      }, "extractText");
      const extracted = extractText(responseBody);
      const result = { text: extracted || "", raw: responseBody };
      return new Response(JSON.stringify(result), { status: externalRes.status, headers: { "Content-Type": "application/json", ...corsHeaders } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
  }
};

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-PBciVv/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = gemini_proxy_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-PBciVv/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=gemini-proxy.js.map
