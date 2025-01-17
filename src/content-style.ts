import { browser } from './core/browser';

function main() {
  var document_observer = new MutationObserver(function (mutations) {
    // 기본 css가 important가 되기 때문에, 모든 css파일이 로드가 된 후에 추가합니다.
    // 기본적으로 추가되는 head의 child가 27개이므로 전부다 로드가 되면 해당 css를 주입합니다.
    if (document.head.childElementCount > 26) {
      // favicon 삽입
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = 'https://www.kw.ac.kr/ko/img/favicon.ico';
      document.getElementsByTagName('head')[0].appendChild(favicon);

      // 크롬 sync 스토리지 이용해 체크 여부 확인
      try {
        // dark mode 적용
        browser.storage.sync.get(null, function (items) {
          // chrome namespace not supported
          if (items.useDark === undefined) {
            browser.storage.sync.set({ 'useDark': 'OFF' });
          }
          else if (items.useDark === 'ON') {
            //  다크모드 css 삽입
            const style = document.createElement('link');
            style.href = browser.runtime.getURL('dark.css');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            document.querySelector('head')?.append(style);
          }
        });
        // 커스텀 디자인
        const style = document.createElement('link');
        style.href = browser.runtime.getURL('advanced-design.css');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        document.querySelector('head')?.append(style);
        // 상단바 투명화
        window.addEventListener('scroll', function () {
          const scrollPercentage = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
          const opacityValue = Math.max(1 - scrollPercentage, 0.5);
          const bgTopElement = document.querySelector('.bg-top') as HTMLElement;
          bgTopElement.style.setProperty('background-color', `rgba(58, 5, 31, ${opacityValue})`, 'important');
        });
        // 배경 색 적용
        document.querySelector('body')?.setAttribute('class', 'py-4 bg-light');
        document.body.style.setProperty('padding-top', '0', 'important');
        document.body.style.setProperty('padding-bottom', '0', 'important');
      }
      catch (e) {

      }

      document_observer.disconnect();
    }
  });

  document_observer.observe(document, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

// 크롬 sync 스토리지 이용해 체크 여부 확인
try {
  browser.storage.sync.get('currentState', function (items) {
    // chrome namespace not supported
    if (items === undefined) {
      main();
    }
    else if (items.currentState === undefined) {
      browser.storage.sync.set({ 'currentState': 'ON' });
      main();
    }
    else if (items.currentState === 'ON') {
      main();
    }
  });
}
catch (e) {
  main();
}

