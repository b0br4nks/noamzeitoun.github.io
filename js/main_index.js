console.log("I have a truly marvelous self-description, which this margin is too narrow to contain.")
const secret = '76861742061726520796f75206c6f6f6b696e6720666f723f203b29';
const username = 'nzrlabs';
const apiUrl = `https://cryptohack.org/api/user/${username}/`;
const toggleButton = document.getElementById('themeToggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
  body.classList.toggle('dark-theme');
  const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme + '-theme');
}

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur de réseau - ${response.status}`);
    }
    return response.json();
  })
  .then(userData => {
    const { rank, score, solved_challenges } = userData;
    document.getElementById('rank').textContent = rank;
    document.getElementById('score').textContent = score;
    document.getElementById('solved_challenges').textContent = solved_challenges.length;
  })
  .catch(error => {
    console.error('Une erreur s\'est produite:', error);
  });
