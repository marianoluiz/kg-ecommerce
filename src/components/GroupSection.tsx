import { teamMembers } from "@/data/team";

export function GroupSection() {
  return (
    <section className="group-section" id="about">
      <div className="group-container">
        <h2>Developed By Group 5</h2>
        <p>This e-commerce platform and business proposition is a capstone initiative submitted to the College of Information System and Technology Management (CISTM), CS Elective 3.</p>
        <ul className="team-list">
          {teamMembers.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
