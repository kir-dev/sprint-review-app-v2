// Health endpoint for Kubernetes readiness/liveness probes.
//
// Deliberately dependency-free: it does NOT check the backend. A frontend pod
// that can serve requests is healthy even while the backend is down, and
// coupling the two would let a backend outage restart every frontend pod --
// the failure mode the k8s docs warn about for badly scoped liveness probes.
//
// Route Handlers do not render the root layout, so this never triggers the
// branding fetch in app/layout.tsx.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(
    { status: 'ok' },
    { headers: { 'cache-control': 'no-store' } },
  );
}
