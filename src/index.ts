/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-param-reassign */
/* eslint-disable no-eval */
/* eslint-disable array-callback-return */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-return-await */
/* eslint-disable no-console */
/* eslint-disable arrow-body-style */

const ATTRIBUTE_TYPE = 'text/zirscript';
const PRE = '@';

window.$ = document.querySelector.bind(document);
window.$selectOne = document.querySelector.bind(document);
window.$selectAll = document.querySelectorAll.bind(document);

window.$selectSome = (selectedElement: string[]) => {
  return selectedElement.map((element: string) => document.querySelector(element));
};

const findZirScripts: Function = (scripts: HTMLScriptElement[]) => {
  return scripts.filter((script) => {
    const attrType = script.getAttribute('type');
    return attrType === ATTRIBUTE_TYPE;
  });
};

const getLinkSource : Function = (scripts: HTMLScriptElement[]) => {
  return scripts.map((script) => script.src);
};

const getSourceCode : Function = (scripts: string[]) => {
  const source = scripts.map((script) => {
    return fetch(script).then((res) => res.text());
  });

  return source;
};

// const readSourceCodeZS: Function = (sourceCode: Promise<string>[]) => {
//   sourceCode.map(function (source) {
//     source.then((code) => {
//       if (code.includes('@selectOne')) {
//         // console.log(Array.from(code));
//       }
//     });
//   });
// };

const keywords = {
  selectOne: `${PRE}selectOne`,
};

window.addEventListener('DOMContentLoaded', () => {
  const scriptsTag = Array.from(document.querySelectorAll('script'));
  const zirScript = findZirScripts(scriptsTag);
  const links = getLinkSource(zirScript);
  const sourceCode = getSourceCode(links);

  zirScript.map((script: HTMLScriptElement) => {
    script.setAttribute('type', 'text/javascript');
    sourceCode.map(function (source: Promise<any>) {
      source.then((code) => {
        let result = '';

        if (code.includes(keywords.selectOne)) {
          const splitCode = code.split('\n');
          const indexHasKey = splitCode.findIndex((data: string) => data.includes(keywords.selectOne));

          const statementSplit = splitCode[indexHasKey].split(' ').map((data: string) => data);

          const indexOfKey = statementSplit.findIndex((data: string) => data === keywords.selectOne);

          if (!statementSplit[indexOfKey + 1]) {
            throw Error(`${keywords.selectOne} must has selector. example: ${keywords.selectOne} h1`);
          }

          const selectorLastIndex = statementSplit.length - 1;
          statementSplit[selectorLastIndex] = "";

          const lastIndex = splitCode[indexHasKey].split(' ').map((data: string) => data).length - 1;
          const selector = splitCode[indexHasKey].split(' ').filter((_data: number, index: number) => index === lastIndex).join('');

          const statement = statementSplit.map((data: string) => (data === keywords.selectOne ? `document.querySelector(${selector})` : data)).slice(0, indexOfKey + 1).join(' ');

          splitCode[indexHasKey] = statement;

          result += splitCode.join('\n');
        }

        console.log(result);
        eval(result);
      });
    });
  });

  // readSourceCodeZS(sourceCode);
});
