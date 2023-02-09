document.getElementById('logo2').style.display = 'none';
function switchTheme() {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        document.getElementById('logo2').style.display = 'block';
        document.getElementById('logo1').style.display = 'none';
        } else {
        document.getElementById('logo2').style.display = 'none';
        document.getElementById('logo1').style.display = 'block';
    }
}