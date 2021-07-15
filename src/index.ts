/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-throw-literal */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable array-callback-return */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable no-eval */

class Alert extends HTMLElement {
  connectedCallback() {
    this.text = this.getAttribute('text') || null;
    this.styleObject = this.getAttribute('style') || null;
    this._shadowRoot = this.attachShadow({ mode: 'open' });

    this.render();
  }

  attributeChangedCallback(name: string | number, oldValue: any, newValue: any) {
    this[name] = newValue;
    setTimeout(() => {
      this.render();
    }, 300);
  }

  static get observedAttributes() {
    return ['text'];
  }

  render() {
    this._shadowRoot.innerHTML = `
      <style>
        .alert {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
        }

        .alert-box {
          margin: auto;
          padding: 1rem;
          box-shadow: 0px 0px 3px black;
          border-radius: 3px;
          text-align: left;
          width: 200px;
        }

        .alert-action {
          display: flex;
          justify-content: flex-end;
        }
        
        .alert-text {
          font-size: 1em;
        }

        .alert-btn {
          padding: .5rem 1.2rem;
          background: #689ADC;
          color: white;
          border: none;
          cursor: pointer;
          border-radius: 3px;
        }
      </style>

      <div class='alert'>
        <div class='alert-box'>
          <span class='alert-text'>${this.text.split(',').join(' ')}</span>
          <div class='alert-action'>
            <button id='alert-btn-custom-zs'>Oke</button/>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('alert-custom', Alert);

window.$ = document.querySelector.bind(document);
window.$selectOne = document.querySelector.bind(document);
window.$selectAll = document.querySelectorAll.bind(document);
window.$selectSome = (selectedElement: string[]) => selectedElement.map((element: string) => document.querySelector(element));

window.alertCustom = function (msg: string) {
  document.body.innerHTML += `
    <alert-custom text=${msg.trim().split(' ')}>
  `.trim();
};

[Node, NodeList].forEach((type) => {
  type.prototype.on = function (...args: [string, EventListener]) {
    const [event, callback]: [string, EventListener] = args;
    if (typeof event === 'string' && typeof callback === 'function') {
      if (this instanceof Element) { return this.addEventListener(event, callback); }
      return this.forEach((nodeList: Node) => nodeList.addEventListener(event, callback));
    }
    throw 'Error';
  };
});

const findZirScripts: Function = (scripts: HTMLScriptElement[]) => scripts.filter((script) => {
  const attrType = script.getAttribute('type');
  return attrType === 'text/zirscript';
});

const getLinkSource: Function = (scripts: HTMLScriptElement[]) => scripts.map((script) => script.src);

const getSourceCode: Function = (scripts: string[]) => {
  const source = scripts.map((script) => fetch(script).then((res) => res.text()));
  return source;
};

window.addEventListener('DOMContentLoaded', () => {
  const scriptsTag = Array.from(document.querySelectorAll('script'));
  const zirScript = findZirScripts(scriptsTag);
  const links = getLinkSource(zirScript);
  const sourceCode = getSourceCode(links);
  readSourceCodeZS(sourceCode, zirScript);
});

const readSourceCodeZS: Function = (
  sourceCode: Promise<string>[],
  zirScript: HTMLScriptElement[],
) => {
  zirScript.map((script: HTMLScriptElement) => {
    script.setAttribute('type', 'text/javascript');
    evalScript(sourceCode);
  });
};

const evalScript = (sourceCode: Promise<string>[]) => {
  sourceCode.map((source: Promise<any>) => {
    source.then((code) => {
      let result = '';

      if (code.includes('@box')) {
        result += code.replace('@box', 'alert');
      }

      return eval(result);
    });
  });
};
