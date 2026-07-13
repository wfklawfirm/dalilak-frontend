/**
 * Dalilak AI — Input Sanitization (Phase 11)
 *
 * Sanitizes user input before sending to the AI backend.
 * Strips prompt-injection patterns and enforces length limits.
 */

const MAX_INPUT_LENGTH = 2000

// Patterns that suggest prompt injection attempts
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(previous|prior|above) instructions?/i,
  /you are now/i,
  /forget (everything|all|your instructions?)/i,
  /act as (a |an )?(different|new|another|evil|jailbreak)/i,
  /\[SYSTEM\]/i,
  /\[INST\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /###\s*instruction/i,
  /pretend (you are|to be)/i,
]

export function sanitizeInput(text: string): { clean: string; flagged: boolean } {
  // Trim and enforce length
  let clean = text.trim().slice(0, MAX_INPUT_LENGTH)

  // Check for injection patterns
  const flagged = INJECTION_PATTERNS.some(p => p.test(clean))

  // Remove null bytes and control characters (except newlines/tabs)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return { clean, flagged }
}

/**
 * Sanitize AI output for display.
 * Strips dangerous HTML tags that could have slipped through.
 * The renderer already uses dangerouslySetInnerHTML=false (plain text/markdown),
 * so this is an extra defensive layer.
 */
export function sanitizeAIOutput(text: string): string {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export { MAX_INPUT_LENGTH }
