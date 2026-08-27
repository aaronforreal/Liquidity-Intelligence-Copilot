import { Activity, LockKeyhole, Search, ShieldCheck } from "./icons";
import type { DashboardData } from "@/lib/types";

const controls = [
  { icon: LockKeyhole, title: "Privacy & security", text: "Synthetic portfolio data and public-source metadata only." },
  { icon: ShieldCheck, title: "Accountability", text: "An analyst remains responsible for every conclusion and action." },
  { icon: Search, title: "Transparency", text: "Every narrative includes its calculation trace and evidence set." },
  { icon: Activity, title: "Monitoring", text: "Engine version, request ID, review status, and generation time are logged." },
];

export function Governance({ data }: { data: DashboardData }) {
  return (
    <section className="governance" id="governance">
      <div className="section-heading">
        <div><span className="eyebrow"><ShieldCheck size={13} /> Responsible AI by design</span><h2>Controls are part of the product.</h2></div>
        <p>Built around the practical principles expected of AI in a regulated risk function.</p>
      </div>
      <div className="control-grid">
        {controls.map(({ icon: Icon, title, text }) => (
          <article key={title}><span><Icon size={18} /></span><h3>{title}</h3><p>{text}</p></article>
        ))}
      </div>
      <div className="audit-strip">
        <div><span>Data classification</span><strong>{data.audit.data_classification}</strong></div>
        <div><span>Engine version</span><strong>{data.audit.engine_version}</strong></div>
        <div><span>Review state</span><strong>{data.audit.review_status}</strong></div>
        <div><span>Request ID</span><strong>{data.audit.request_id}</strong></div>
      </div>
    </section>
  );
}
