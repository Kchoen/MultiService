const commentFormEl = document.getElementById('comment-form');
const commentsListEl = document.getElementById('comments-list');
var ele;
// Handle form submission
commentFormEl.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(commentFormEl);
  const name = formData.get('name');
  const comment = formData.get('comment');

  fetch('/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, comment }),
  })
    .then(res => res.json())
    .then(comment => {
      const listItemEl = document.createElement('li');
      listItemEl.id = comment.id
        listItemEl.innerHTML = `
        <p><strong>${comment.name}:</strong> ${comment.comment}  <button onClick="delBtn(this)" data-value="${comment.id}" class="delete-button">Delete</button></p>
        
      `;
      commentsListEl.appendChild(listItemEl);
      commentFormEl.reset();
    })
    .catch(err => console.error(err));
});


fetch('/comments')
  .then(res => res.json())
  .then(comments => {
    if (comments.length === 0) {
        commentsListEl.textContent = 'No message yet.';
    } else {
        comments.forEach(comment => {
        const listItemEl = document.createElement('li');
        listItemEl.id = comment.id
        listItemEl.innerHTML = `
        <p><strong>${comment.name}:</strong> ${comment.comment}  <button onClick="delBtn(this)" data-value="${comment.id}" class="delete-button">Delete</button></p>
        
      `;
        commentsListEl.appendChild(listItemEl);
      });
    }
  })
  .catch(err => {
    console.error(err);
    listItemEl.textContent = 'Failed to retrieve bulletin board.';
  });

function delBtn(e){
    ele = e;
    console.log(e);
    fetch(`/comments/${e.dataset.value}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
            document.getElementById(e.dataset.value).remove();
        })
    .catch(err => console.error(err));
    
}