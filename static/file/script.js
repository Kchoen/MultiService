const filesListEl = document.getElementById('files-list');

fetch('/list-files')
  .then(res => res.json())
  .then(files => {
    if (files.length === 0) {
      filesListEl.textContent = 'No files uploaded yet.';
    } else {
      const listEl = document.createElement('ul');
      files.forEach(file => {
        const listItemEl = document.createElement('li');
        const linkEl = document.createElement('a');
        linkEl.textContent = file;
        linkEl.href = `/download/${encodeURIComponent(file)}`;
        listItemEl.appendChild(linkEl);
        listEl.appendChild(listItemEl);
      });
      filesListEl.appendChild(listEl);
    }
  })
  .catch(err => {
    console.error(err);
    filesListEl.textContent = 'Failed to retrieve files list.';
  });
