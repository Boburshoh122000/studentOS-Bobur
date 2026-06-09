(function () {
  var stored = localStorage.getItem('studentos-theme');
  var theme = stored === 'dark' ? 'dark' : stored === 'light' ? 'light' : null;
  if (theme) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
})();
