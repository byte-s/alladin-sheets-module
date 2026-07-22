define(['jquery'], function ($) {
    return function () {
        var self = this;

        // Значение по умолчанию, если поле "Адрес API" не заполнено в настройках виджета.
        var DEFAULT_ENDPOINT_URL = 'https://alladin-sheets-module.vercel.app/api/send-lead';

        function getEndpointUrl() {
            var settings = self.get_settings ? self.get_settings() : null;
            return (settings && settings.endpoint_url) || DEFAULT_ENDPOINT_URL;
        }

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

            fetch(getEndpointUrl(), {
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

        function injectButton() {
            if ($('.sheet-sync-widget').length) {
                return true;
            }

            var body =
                '<div class="sheet-sync-widget">' +
                '<button type="button" class="sheet-sync-widget__button button-input">' + self.i18n('button.send') + '</button>' +
                '<div class="sheet-sync-widget__status"></div>' +
                '</div>';

            // Пытаемся встроиться в панель виджетов карточки (разные версии интерфейса amoCRM
            // используют разную разметку, поэтому перебираем несколько известных контейнеров).
            var candidates = [
                '.card-widgets',
                '.left-widgets',
                '.widgets-side-block',
                '.js-widgets-list',
                '#panel_widgets',
            ];

            for (var i = 0; i < candidates.length; i++) {
                var $container = $(candidates[i]);
                if ($container.length) {
                    $container.prepend(body);
                    return true;
                }
            }

            // Ни один известный контейнер не найден — показываем плавающую кнопку,
            // чтобы функциональность всё равно была доступна.
            $('body').append(
                '<div class="sheet-sync-widget sheet-sync-widget--floating">' +
                '<button type="button" class="sheet-sync-widget__button button-input">' + self.i18n('button.send') + '</button>' +
                '<div class="sheet-sync-widget__status"></div>' +
                '</div>'
            );
            return true;
        }

        self.callbacks = {
            render: function () {
                // Само тело виджета не рендерим здесь через render_template (в текущей версии
                // интерфейса это приводит к ошибке загрузки twig-шаблона) — кнопку вставляем
                // напрямую в init/bind_actions.
                return true;
            },

            init: function () {
                injectButton();
                setTimeout(injectButton, 500);
                setTimeout(injectButton, 1500);
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
                $('.sheet-sync-widget').remove();
                return true;
            },
        };

        return this;
    };
});
