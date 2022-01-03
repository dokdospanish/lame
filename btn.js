/* SETTINGS */
UIlang = 'en'; /* OR 'ko' */
susLimit = 85;
setting = (typeof setting == 'undefined' || setting == 'word') ? 'char' : 'word'; /* for objection similarity */

/* LINKS */
releaseRoot = 'https://cdn.jsdelivr.net/gh/dokdospanish/lame@v0.0/';
currentUrl = window.location.href;

/* REGEX */
rxLameSite = /lame\.netlify\.app/;
rxCrowdMonitoring = /a\.flit\.to:4435\/admin#\/admin\/req_tr/;
rxObjection = /a3\.flit\.to\/#\/arcade\/arcade-objection/;
rxFlittoApi = /api-demo\.flit\.to/;
rxTranslatorsTo = /translators\.to/;
rxProApplicant = /a3\.flit\.to\/#\/pro-tr\/pro-applicant\/\d/;

/* FLOW */
if (
  rxCrowdMonitoring.test(currentUrl)
  && !document.head.querySelectorAll(`[src="${releaseRoot}crowd-monitoring.js"]`).length
  ) { injectRemoteScript(`${releaseRoot}crowd-monitoring.js`) }

else if (
  rxObjection.test(currentUrl)
  ) { injectRemoteScript(`${releaseRoot}objection-compare.js`) }

else if (
  rxFlittoApi.test(currentUrl)
  || rxTranslatorsTo.test(currentUrl)
  ) { injectRemoteScript(`${releaseRoot}mt-similarity.js`) }

else if (  rxLameSite.test(currentUrl)
  ) { alert('1. Drag button to bookmarks bar.\n\n2. Use button in one of these sites:\n   - Vitamin\'s Arcade Objection\n   - Flitto\'s API demo\n   - translators.to \n   - Old Flitto Admin > crowd_tr > req_tr') }




/* HELPER */
function injectRemoteScript(src) {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.addEventListener('load', resolve);
      script.addEventListener('error', e => reject(e.error));
      document.head.appendChild(script);
  });
}
