import re

with open("src/pages/About.tsx", "r") as f:
    content = f.read()

# Update spacing and tag removal
old_leadership_pattern = r'<div className="flex flex-col items-center gap-12">.*?<\/section>'
new_leadership_section = """<div className="flex flex-col items-center gap-12 md:gap-16">
            {/* Pyramid Grid */}
            {(() => {
              const rows = [];
              let i = 0;
              let isThree = true;
              while (i < teamMembers.length) {
                const count = isThree ? 3 : 2;
                rows.push(teamMembers.slice(i, i + count));
                i += count;
                isThree = !isThree;
              }

              if (rows.length === 0) {
                return <p className="text-brand-mid-grey text-center w-full">Leadership details not configured yet.</p>;
              }

              return rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-8 md:gap-24 w-full max-w-[1000px] flex-wrap md:flex-nowrap">
                  {row.map((member, memberIndex) => (
                    <FadeIn key={member._id} delay={memberIndex * 0.1} className="text-center flex flex-col items-center w-[160px] md:w-[220px]">
                      <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-brand-black mb-6 relative overflow-hidden flex items-center justify-center shadow-lg">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="noise-overlay opacity-40"></div>
                        )}
                      </div>
                      <h4 className="font-sans font-semibold text-[20px] text-brand-black mb-1">{member.name}</h4>
                      <p className="font-sans text-[14px] text-brand-mid-grey font-medium mb-3">{member.role}</p>
                      <p className="font-sans text-[14px] text-brand-mid-grey leading-relaxed px-2">{member.bio}</p>
                    </FadeIn>
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>
      </section>"""

content = re.sub(old_leadership_pattern, new_leadership_section, content, flags=re.DOTALL)

with open("src/pages/About.tsx", "w") as f:
    f.write(content)
