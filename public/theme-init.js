(function () {
  var t = localStorage.getItem('admin-theme');
  if (t && t !== 'navy-cyan') document.documentElement.dataset.theme = t;
})();
