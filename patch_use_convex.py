import re

with open("src/lib/useConvex.tsx", "r") as f:
    content = f.read()

if "useUpdateTeamMemberOrder" not in content:
    content += """
export function useUpdateTeamMemberOrder() {
  return useMutation(api.teamMembers.updateOrder);
}
"""

with open("src/lib/useConvex.tsx", "w") as f:
    f.write(content)
