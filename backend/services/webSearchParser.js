export function parseWebFindings(contentBlocks) {
  const findings = [];

  if (!Array.isArray(contentBlocks)) return findings;

  for (const block of contentBlocks) {
    if (block.type === 'tool_use' && block.name === 'web_search') {
      // Record the search query
    }
    if (block.type === 'tool_result') {
      const content = block.content;
      if (Array.isArray(content)) {
        for (const item of content) {
          if (item.type === 'text') {
            try {
              const results = JSON.parse(item.text);
              if (Array.isArray(results)) {
                results.forEach(r => {
                  findings.push({
                    url: r.url || '',
                    title: r.title || '',
                    snippet: r.snippet || r.content || '',
                    timestamp: new Date().toISOString()
                  });
                });
              }
            } catch {
              findings.push({
                url: '',
                title: 'Web Result',
                snippet: item.text.substring(0, 500),
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
    }
  }

  return findings;
}

export function formatFindingsForDisplay(findings) {
  if (!findings || findings.length === 0) {
    return [{ label: 'No web results retrieved', url: '', snippet: '' }];
  }

  return findings.map(f => ({
    label: f.title || f.url || 'Web Result',
    url: f.url,
    snippet: f.snippet,
    timestamp: f.timestamp
  }));
}
