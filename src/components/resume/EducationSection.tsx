import type { EducationItem } from "@/lib/types";

interface EducationSectionProps {
  education: EducationItem[];
}

export function EducationSection({ education }: EducationSectionProps) {
  return (
    <div className="space-y-6">
      {education.map((edu) => (
        <div key={edu.id} className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <div>
            <h3 className="font-serif text-lg font-normal">{edu.institution}</h3>
            <p className="text-muted-foreground text-sm">
              {edu.degree} · {edu.field}
            </p>
            {edu.notes && (
              <p className="text-muted-foreground/70 text-sm mt-1 italic">
                {edu.notes}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground shrink-0">
            {edu.startYear} – {edu.endYear}
          </p>
        </div>
      ))}
    </div>
  );
}
