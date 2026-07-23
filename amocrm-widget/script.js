define(['jquery'], function ($) {
    return function () {
        var self = this;

        // Значения по умолчанию, если поля настроек виджета не заполнены.
        var DEFAULT_SYNC_ENDPOINT_URL = 'https://alladin-sheets-module.vercel.app/api/send-lead';
        var DEFAULT_GENERATE_ENDPOINT_URL = 'https://alladin-sheets-module.vercel.app/api/generate-docs';

        function getSyncEndpointUrl() {
            var settings = self.get_settings ? self.get_settings() : null;
            return (settings && settings.endpoint_url) || DEFAULT_SYNC_ENDPOINT_URL;
        }

        function getGenerateEndpointUrl() {
            var settings = self.get_settings ? self.get_settings() : null;
            return (settings && settings.generate_endpoint_url) || DEFAULT_GENERATE_ENDPOINT_URL;
        }

        function getLeadIdFromUrl() {
            var match = window.location.pathname.match(/\/leads\/detail\/(\d+)/);
            return match ? match[1] : null;
        }

        function setButtonState($btn, $status, state, labels) {
            if (state === 'sending') {
                $btn.prop('disabled', true);
                $status.text(self.i18n(labels.sending)).removeClass('sheet-sync-widget__status--error sheet-sync-widget__status--success');
            } else if (state === 'success') {
                $btn.prop('disabled', false);
                $status.text(self.i18n(labels.success)).addClass('sheet-sync-widget__status--success').removeClass('sheet-sync-widget__status--error');
            } else if (state === 'error') {
                $btn.prop('disabled', false);
                $status.text(self.i18n(labels.error)).addClass('sheet-sync-widget__status--error').removeClass('sheet-sync-widget__status--success');
            } else {
                $btn.prop('disabled', false);
                $status.text('').removeClass('sheet-sync-widget__status--error sheet-sync-widget__status--success');
            }
        }

        function callEndpoint(url, leadId, $btn, $status, labels) {
            if (!leadId) {
                setButtonState($btn, $status, 'error', labels);
                return;
            }

            setButtonState($btn, $status, 'sending', labels);

            fetch(url, {
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
                    setButtonState($btn, $status, 'success', labels);
                })
                .catch(function () {
                    setButtonState($btn, $status, 'error', labels);
                });
        }

        var SYNC_LABELS = { sending: 'button.sending', success: 'button.success', error: 'button.error' };
        var GENERATE_LABELS = { sending: 'button.generating', success: 'button.generate_success', error: 'button.generate_error' };

        self.onSyncButtonClick = function () {
            callEndpoint(getSyncEndpointUrl(), getLeadIdFromUrl(), $('.sheet-sync-widget__button--sync'), $('.sheet-sync-widget__status--sync'), SYNC_LABELS);
        };

        self.onGenerateButtonClick = function () {
            callEndpoint(getGenerateEndpointUrl(), getLeadIdFromUrl(), $('.sheet-sync-widget__button--generate'), $('.sheet-sync-widget__status--generate'), GENERATE_LABELS);
        };

        function widgetMarkup() {
            return (
                '<div class="sheet-sync-widget">' +
                '<button type="button" class="sheet-sync-widget__button sheet-sync-widget__button--sync button-input">' + self.i18n('button.send') + '</button>' +
                '<div class="sheet-sync-widget__status sheet-sync-widget__status--sync"></div>' +
                '<button type="button" class="sheet-sync-widget__button sheet-sync-widget__button--generate button-input">' + self.i18n('button.generate') + '</button>' +
                '<div class="sheet-sync-widget__status sheet-sync-widget__status--generate"></div>' +
                '</div>'
            );
        }

        function injectButton() {
            if ($('.sheet-sync-widget').length) {
                return true;
            }

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
                    $container.prepend(widgetMarkup());
                    return true;
                }
            }

            // Ни один известный контейнер не найден — показываем плавающую кнопку,
            // чтобы функциональность всё равно была доступна.
            $('body').append('<div class="sheet-sync-widget sheet-sync-widget--floating">' + widgetMarkup() + '</div>');
            return true;
        }

        self.callbacks = {
            render: function () {
                // Само тело виджета не рендерим здесь через render_template (в текущей версии
                // интерфейса это приводит к ошибке загрузки twig-шаблона) — кнопки вставляем
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
                // amoCRM может вызывать bind_actions повторно без destroy (например, при
                // повторном рендере карточки) — сперва снимаем старый обработчик, иначе
                // на кнопке накапливается несколько обработчиков и один клик шлёт
                // несколько параллельных запросов (это приводило к дублям строк в таблице).
                $(document).off('click', '.sheet-sync-widget__button--sync', self.onSyncButtonClick);
                $(document).off('click', '.sheet-sync-widget__button--generate', self.onGenerateButtonClick);
                $(document).on('click', '.sheet-sync-widget__button--sync', self.onSyncButtonClick);
                $(document).on('click', '.sheet-sync-widget__button--generate', self.onGenerateButtonClick);
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
                $(document).off('click', '.sheet-sync-widget__button--sync', self.onSyncButtonClick);
                $(document).off('click', '.sheet-sync-widget__button--generate', self.onGenerateButtonClick);
                $('.sheet-sync-widget').remove();
                return true;
            },
        };

        return this;
    };
});
