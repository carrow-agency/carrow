import re

with open("src/pages/About.tsx", "r") as f:
    content = f.read()

# Add import for useTeamMembers
if "useTeamMembers" not in content:
    content = content.replace("import { useSettings } from '../lib/useConvex';", "import { useSettings, useTeamMembers } from '../lib/useConvex';")

# replace about logic in component
content = re.sub(r'  const about = settings\?\.aboutPage;\n', r'  const teamMembers = useTeamMembers();\n', content)

# replacement rendering for the leadership section
new_leadership_section = """      <section className="py-16 md:py-[140px] bg-brand-off-white px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <FadeIn>
             <h2 className="font-serif font-bold text-[28px] md:text-[48px] text-brand-black mb-16 text-center">The Leadership.</h2>
          </FadeIn>
          
          <div className="flex flex-col items-center gap-12">
            {/* Pyramid Grid */}
            {(() => {
              // Group members into alternating rows of 3 and 2
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
                <div key={rowIndex} className={`flex justify-center gap-8 md:gap-16 flex-wrap`}>
                  {row.map((member, memberIndex) => (
                    <FadeIn key={member._id} delay={memberIndex * 0.1} className="text-center flex flex-col items-center max-w-[300px]">
                      <div className="w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full bg-brand-black mb-6 relative overflow-hidden flex items-center justify-center shadow-lg">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="noise-overlay opacity-40"></div>
                        )}
                        {member.tag && (
                          <div className="absolute bottom-4 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                            {member.tag}
                          </div>
                        )}
                      </div>
                      <h4 className="font-sans font-semibold text-[20px] text-brand-black mb-1">{member.name}</h4>
                      <p className="font-sans text-[14px] text-brand-mid-grey font-medium mb-3">{member.role}</p>
                      <p className="font-sans text-[14px] text-brand-mid-grey leading-relaxed">{member.bio}</p>
                    </FadeIn>
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>
      </section>"""

content = re.sub(r'      <section className="py-16 md:py-\[140px\] bg-brand-off-white px-6 md:px-12">\n        <div className="max-w-\[1280px\] mx-auto">\n          <FadeIn>\n             <h2 className="font-serif font-bold text-\[28px\] md:text-\[48px\] text-brand-black mb-16 text-center">The Leadership\.</h2>\n          </FadeIn>\n          \n          <div className="flex justify-center">.*?<\/section>', new_leadership_section, content, flags=re.DOTALL)

with open("src/pages/About.tsx", "w") as f:
    f.write(content)

