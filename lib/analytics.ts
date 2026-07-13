/**
 * Dalilak AI — Analytics Service (Phase 15)
 *
 * Provider-agnostic event abstraction.
 * Replace the body of `track()` with Plausible / PostHog / Mixpanel / GA4
 * when ready. Never include sensitive content in event properties.
 *
 * TODO: Wire a real analytics provider when NEXT_PUBLIC_ANALYTICS_PROVIDER is set.
 */

export type DalilakEvent =
  | { name: 'procedure_selected';       props: { slug: string; title: string } }
  | { name: 'guided_flow_started';      props: { slug?: string } }
  | { name: 'guided_flow_completed';    props: { slug?: string; steps: number } }
  | { name: 'checklist_downloaded';     props: { procedure?: string } }
  | { name: 'form_opened';              props: { slug: string; title: string } }
  | { name: 'document_uploaded';        props: { fileType: string } }
  | { name: 'answer_copied';            props: { confidence?: string } }
  | { name: 'feedback_submitted';       props: { rating: 'up' | 'down'; confidence?: string } }
  | { name: 'low_confidence_answer';    props: { query_type?: string } }
  | { name: 'upgrade_clicked';          props: { source: string; plan?: string } }
  | { name: 'escalation_requested';     props: { request_type: string } }
  | { name: 'search_performed';         props: { surface: 'procedures' | 'forms'; query_length: number } }

const PROVIDER = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  : null

export function track(event: DalilakEvent): void {
  if (typeof window === 'undefined') return

  // Dev: log to console
  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', event.name, event.props)
  }

  try {
    // ── Plausible ─────────────────────────────────────────────
    if (PROVIDER === 'plausible' && (window as any).plausible) {
      (window as any).plausible(event.name, { props: event.props })
      return
    }

    // ── PostHog ───────────────────────────────────────────────
    if (PROVIDER === 'posthog' && (window as any).posthog) {
      (window as any).posthog.capture(event.name, event.props)
      return
    }

    // ── Google Analytics 4 ────────────────────────────────────
    if (PROVIDER === 'ga4' && (window as any).gtag) {
      (window as any).gtag('event', event.name, event.props)
      return
    }

    // No provider configured — silently no-op in production
  } catch {
    // Never let analytics errors break the app
  }
}

/** Convenience wrappers */
export const Analytics = {
  procedureSelected:    (slug: string, title: string)              => track({ name: 'procedure_selected',    props: { slug, title } }),
  guidedFlowStarted:    (slug?: string)                            => track({ name: 'guided_flow_started',   props: { slug } }),
  guidedFlowCompleted:  (slug: string | undefined, steps: number)  => track({ name: 'guided_flow_completed', props: { slug, steps } }),
  checklistDownloaded:  (procedure?: string)                       => track({ name: 'checklist_downloaded',  props: { procedure } }),
  formOpened:           (slug: string, title: string)              => track({ name: 'form_opened',           props: { slug, title } }),
  documentUploaded:     (fileType: string)                         => track({ name: 'document_uploaded',     props: { fileType } }),
  answerCopied:         (confidence?: string)                      => track({ name: 'answer_copied',         props: { confidence } }),
  feedbackSubmitted:    (rating: 'up' | 'down', confidence?: string) => track({ name: 'feedback_submitted', props: { rating, confidence } }),
  lowConfidenceAnswer:  (query_type?: string)                      => track({ name: 'low_confidence_answer', props: { query_type } }),
  upgradeClicked:       (source: string, plan?: string)            => track({ name: 'upgrade_clicked',       props: { source, plan } }),
  escalationRequested:  (request_type: string)                     => track({ name: 'escalation_requested',  props: { request_type } }),
  searchPerformed:      (surface: 'procedures' | 'forms', query_length: number) => track({ name: 'search_performed', props: { surface, query_length } }),
}
