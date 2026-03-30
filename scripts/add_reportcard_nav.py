"""Add Report Card nav link to all HTML pages (nav + footer)."""
import os
import re

FRONTEND = os.path.join(os.path.dirname(__file__), '..', 'frontend')
SKIP = {'reportcard.html'}

# Nav: insert after opportunity.html link
NAV_AFTER = '<li><a href="/opportunity.html"'
NAV_INSERT = '    <li><a href="/reportcard.html">Report Card</a></li>'

# Footer: insert after opportunity.html link
FOOTER_AFTER = '<a href="/opportunity.html" style="color:var(--ink-light); text-decoration:none;">Opportunity</a>'
FOOTER_INSERT = '''    <span style="margin:0 8px;">|</span>
    <a href="/reportcard.html" style="color:var(--ink-light); text-decoration:none;">Report Card</a>'''

count = 0
for fname in sorted(os.listdir(FRONTEND)):
    if not fname.endswith('.html') or fname in SKIP:
        continue
    path = os.path.join(FRONTEND, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '/reportcard.html' in content:
        print(f'SKIP (already has link): {fname}')
        continue

    modified = False

    # Add nav link
    if NAV_AFTER in content:
        # Find the full line with the opportunity link
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            new_lines.append(line)
            if NAV_AFTER in line and '/reportcard.html' not in line:
                new_lines.append(NAV_INSERT)
                modified = True
        if modified:
            content = '\n'.join(new_lines)

    # Add footer link
    if FOOTER_AFTER in content and '/reportcard.html' not in content:
        content = content.replace(
            FOOTER_AFTER,
            FOOTER_AFTER + '\n' + FOOTER_INSERT
        )
        modified = True

    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f'UPDATED: {fname}')
    else:
        print(f'NO MATCH: {fname}')

print(f'\nTotal updated: {count}')
