import { startTransition, useDeferredValue, useState } from "react";
import { DoctorCard, SectionHeading } from "../components/Shared";
import { useAppContext } from "../context/useAppContext";

export default function DoctorsPage() {
  const { doctors } = useAppContext();
  const [query, setQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All specialties");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const specialties = [
    "All specialties",
    ...new Set(doctors.map((doctor) => doctor.specialty)),
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesQuery =
      !normalizedQuery ||
      doctor.name.toLowerCase().includes(normalizedQuery) ||
      doctor.specialty.toLowerCase().includes(normalizedQuery) ||
      doctor.location.toLowerCase().includes(normalizedQuery) ||
      doctor.focusAreas.some((area) => area.toLowerCase().includes(normalizedQuery));

    const matchesSpecialty =
      specialtyFilter === "All specialties" || doctor.specialty === specialtyFilter;

    return matchesQuery && matchesSpecialty;
  });

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          title="Find the right specialist"
          subtitle="Search by specialty, city, or symptom focus area and move straight into the care request flow."
        />

        <div className="panel filter-bar">
          <label className="field-block">
            <span>Search</span>
            <input
              className="text-input"
              type="search"
              placeholder="Search migraine, rehab, cardiology, New Delhi..."
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => {
                  setQuery(nextValue);
                });
              }}
            />
          </label>

          <label className="field-block">
            <span>Specialty</span>
            <select
              className="text-input"
              value={specialtyFilter}
              onChange={(event) => setSpecialtyFilter(event.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="card-grid three-up">
          {filteredDoctors.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
