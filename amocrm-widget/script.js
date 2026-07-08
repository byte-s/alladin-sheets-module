define(['jquery'], function ($) {
    return function () {
        var self = this;

        // Домен, на котором задеплоен модуль alladin-sheets-module.
        // Поменяйте на реальный адрес после деплоя (например, https://alladin-sheets-module.vercel.app).
        var ENDPOINT_URL = 'https://alladin-sheets-module.vercel.app/api/send-lead';

        function getLeadIdFromUrl() {
            var match = window.location.pathname.match(/\/leads\/detail\/(\d+)/);
            return match ? match[1] : null;
        }

        function setButtonState(state) {
            var $btn = $('.sheet-sync-widget__button');
            var $status = $('.sheet-sync-widget__status');

            if (state === 'sending') {
                $btn.prop('disabled', true);
                $status.text(self.i18n('button.sending')).removeClass('sheet-sync-widget__status--error sheet-sync-widget__status--success');
            } else if (state === 'success') {
                $btn.prop('disabled', false);
                $status.text(self.i18n('button.success')).addClass('sheet-sync-widget__status--success').removeClass('sheet-sync-widget__status--error');
            } else if (state === 'error') {
                $btn.prop('disabled', false);
                $status.text(self.i18n('button.error')).addClass('sheet-sync-widget__status--error').removeClass('sheet-sync-widget__status--success');
            } else {
                $btn.prop('disabled', false);
                $status.text('').removeClass('sheet-sync-widget__status--error sheet-sync-widget__status--success');
            }
        }

        self.onButtonClick = function () {
            var leadId = getLeadIdFromUrl();

            if (!leadId) {
                setButtonState('error');
                return;
            }

            setButtonState('sending');

            fetch(ENDPOINT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: leadId }),
            })
                .then(function (response) {
                    return response.json().then(function (data) {
                        if (!response.ok) {
                            throw new Error(data && data.text);
                        }
                        return data;
                    });
                })
                .then(function () {
                    setButtonState('success');
                })
                .catch(function () {
                    setButtonState('error');
                });
        };

        self.callbacks = {
            render: function () {
                var body =
                    '<div class="sheet-sync-widget">' +
                    '<button type="button" class="sheet-sync-widget__button button-input">' + self.i18n('button.send') + '</button>' +
                    '<div class="sheet-sync-widget__status"></div>' +
                    '</div>';

                self.render_template({
                    caption: {
                        class_name: '',
                        name: self.i18n('widget.name'),
                    },
                    body: body,
                });

                return true;
            },

            init: function () {
                return true;
            },

            bind_actions: function () {
                $(document).on('click', '.sheet-sync-widget__button', self.onButtonClick);
                return true;
            },

            settings: function () {
                return true;
            },

            onSave: function () {
                return true;
            },

            advancedSettings: function () {
                return true;
            },

            dpSettings: function () {
                return true;
            },

            leads: {
                selected: function () {
                    return true;
                },
            },

            contacts: {
                selected: function () {
                    return true;
                },
            },

            destroy: function () {
                $(document).off('click', '.sheet-sync-widget__button', self.onButtonClick);
                return true;
            },
        };

        return this;
    };
});
