var aiChat = new Vue({
  el: '#ai-chat',
  data() {
    return {
      doi: '',
      aiDrawerShow: false,
      lang: 'en_US',
      eventSource: {},
      chatText: {},
      stage: '',
      flag: 1,
      showAI: 0,
      openAMinerLoading: false,
      errorCode: null,
      errorText: '',
    };
  },
  mounted() {
    // this.aiDrawerShow = true;
    $('#ai-chat').css({ display: 'block' });
  },
  methods: {
    initSSE() {
      // 创建一个SSE对象，连接到后端的/chat接口

      if (!this.eventSource[this.lang]) {
        // 监听message事件，接收后端发送的消息
        this.addListener(this.lang);
      }
    },
    addListener(lang) {
      this.chatText[lang] = '';
      const params = $.param({ doi: this.doi, stage: this.stage, flag: this.flag, lang, showAI: this.showAI });
      this.eventSource[lang] = new EventSource(`/article/get_chat?${params}`);
      this.eventSource[lang].addEventListener('message', (event) => {
        try {
          const data = {
            [lang]: JSON.parse(event.data),
          };

          if (data[lang].link === 1) {
            this.chatText[lang] += data[lang].content;
          }

          if (data[lang].link === 2) {
            this.$refs[lang].innerHTML = this.chatText[lang];
            this.eventSource[lang].close();
          } else {
            this.$refs[lang].innerHTML = this.chatText[lang] + '<span class="blink-cursor"></span>';
          }

          if (data[lang].link === 3 || data[lang].link === 4) {
            throw data[lang];
          }

          this.goToBottom();
        } catch (e) {
          console.log('error:', e);

          let errorText = lang === 'zh_CN' ? '发生了未知的错误，请稍后再试。' : 'An unexpected error has occurred. Please try again later.';

          if (e.link) {
            switch (e.link) {
              case 4: {
                errorText = "We've encountered an issue with this particular article. Please consider trying another one for your research needs";
                break;
              }
            }
          }
          this.$refs[lang].innerHTML = errorText;
          this.eventSource[lang].close();
          this.eventSource[lang] = '';
        }
      });
    },
    goToBottom() {
      const bottom = document.getElementById('ai-chat-copyright');
      bottom.scrollIntoView({ behavior: 'instant' });
    },
    async getChat() {
      this.initSSE();
    },
    aiDrawerClose() {
      this.aiDrawerShow = false;
      Object.keys(this.eventSource).forEach((lang) => {
        this.eventSource[lang].close();
        this.eventSource[lang] = '';
        this.$refs[lang].innerHTML = '';
      });
    },
    aiDrawerOpen(doi, stage, flag, showAI) {
      this.doi = doi;
      this.stage = stage;
      this.flag = flag;
      this.showAI = showAI;
      this.aiDrawerShow = true;
      this.getChat();
    },
    switchLang() {
      this.lang = this.lang === 'en_US' ? 'zh_CN' : 'en_US';
      this.initSSE();
    },
    openAMiner() {
      this.openAMinerLoading = true;
      const params = { doi: this.doi, stage: this.stage, flag: this.flag };
      // 根据屏幕尺寸判断是否是移动端，小于1024
      if (document.body.clientWidth > 1024) {
        var newWindow = window.open('/article/ai_chat_redirect');
      }
      axios.get('/article/pdf_chat', { params }).then(
        (res) => {
          this.openAMinerLoading = false;
          if (res.data.status) {
            // 移动端当前页跳转
            if (document.body.clientWidth > 1024) {
              newWindow.location = res.data.object.url;
            } else {
              window.location.href = res.data.object.url;
            }
          } else {
            // PC端报错则关闭页面
            if (document.body.clientWidth > 1024) {
              newWindow.close();
            }
            this.errorCode = res.data.errCode === 10000 ? 400 : res.data.errCode || 404;
            this.errorText = res.data.errCode === 10000 ? "AI Chat doesn't support interactive dialogue for PDF files exceeding 30MB." : 'An unexpected error has occurred. Please try again later.';
            $('#ai-chat-error-modal').modal({ backdrop: 'static' });
          }
        },
        (error) => {
          this.openAMinerLoading = false;
          if (document.body.clientWidth > 1024) {
            newWindow.close();
          }
          this.errorCode = error.response.data.errCode || 404;
          this.errorText = 'An unexpected error has occurred. Please try again later.';
          $('#ai-chat-error-modal').modal({ backdrop: 'static' });
        }
      );
    },
  },
});
