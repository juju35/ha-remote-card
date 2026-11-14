/*
 * Remote Card for Home Assistant
 * https://github.com/juju35/ha-remote-card
 *
 * Lovelace remote control for TVs and streaming boxes: a round D-pad with OK, back / home / menu, volume, channels,
 * transport keys, and a popup of app shortcuts and sources, with what is playing. The integration is detected from the
 * `remote` and `media_player` entities (Apple TV, Android TV Remote, Philips TV, Samsung, LG webOS, Roku, Android Debug
 * Bridge, Kodi) or set with `integration` (Freebox Player), and each key is sent the way that integration expects it;
 * `commands` overrides any of them.
 */

const VERSION = "__VERSION__";

const STRINGS = {
  en: {
    state_on: "On",
    state_off: "Off",
    state_playing: "Playing",
    state_paused: "Paused",
    state_idle: "Idle",
    state_standby: "Standby",
    state_buffering: "Buffering",
    state_unavailable: "Unavailable",
    state_unknown: "Unknown",
    k_power: "Power",
    k_up: "Up",
    k_down: "Down",
    k_left: "Left",
    k_right: "Right",
    k_ok: "OK",
    k_back: "Back",
    k_home: "Home",
    k_menu: "Menu",
    k_volume_up: "Volume up",
    k_volume_down: "Volume down",
    k_mute: "Mute",
    k_channel_up: "Next channel",
    k_channel_down: "Previous channel",
    k_play_pause: "Play / pause",
    k_previous: "Previous",
    k_next: "Next",
    volume: "Volume",
    channel: "Channel",
    sources: "Sources",
    close: "Close",
    apps: "Apps",
    sources_apps: "Sources and apps",
    no_entity: "No remote or media player found. Set the remote (entity) or the media player of the card.",
    unknown_entity: "Entity not found",
    entity: "Remote",
    entity_helper: "Remote entity of the TV or box, used to send the keys",
    media_player: "Media player",
    media_player_helper: "Shows what is playing, the sources and the volume; found from the remote's device when left empty",
    integration: "Integration",
    integration_auto: "Automatic (detected)",
    integration_generic: "Media player only",
    title: "Title (optional, defaults to the device name)",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    show_power: "Show power key",
    show_volume: "Show volume keys",
    show_channels: "Show channel keys",
    show_transport: "Show transport keys",
    show_sources: "Show sources",
    show_apps: "Show apps",
    haptic: "Haptic feedback",
    repeat: "Repeat on long press",
    swipe: "Swipe gestures on the D-pad",
    swipe_helper: "Swipe on the D-pad to move, tap to press the key under your finger",
    language: "Language",
    lang_auto: "Automatic",
    zoom: "Detail button",
    zoom_helper: "Button at the top right that unfolds the mini card into the full remote and back",
    zoom_in: "Show the full remote",
    zoom_out: "Show the compact card",
  },
  fr: {
    state_on: "Allumé",
    state_off: "Éteint",
    state_playing: "Lecture",
    state_paused: "En pause",
    state_idle: "Inactif",
    state_standby: "Veille",
    state_buffering: "Mise en mémoire tampon",
    state_unavailable: "Indisponible",
    state_unknown: "Inconnu",
    k_power: "Marche / arrêt",
    k_up: "Haut",
    k_down: "Bas",
    k_left: "Gauche",
    k_right: "Droite",
    k_ok: "OK",
    k_back: "Retour",
    k_home: "Accueil",
    k_menu: "Menu",
    k_volume_up: "Volume +",
    k_volume_down: "Volume −",
    k_mute: "Muet",
    k_channel_up: "Chaîne suivante",
    k_channel_down: "Chaîne précédente",
    k_play_pause: "Lecture / pause",
    k_previous: "Précédent",
    k_next: "Suivant",
    volume: "Volume",
    channel: "Chaîne",
    sources: "Sources",
    close: "Fermer",
    apps: "Applications",
    sources_apps: "Sources et applications",
    no_entity: "Aucune télécommande ni aucun lecteur multimédia trouvé. Choisissez la télécommande (entity) ou le lecteur multimédia de la carte.",
    unknown_entity: "Entité introuvable",
    entity: "Télécommande",
    entity_helper: "Entité remote de la TV ou du boîtier, qui envoie les touches",
    media_player: "Lecteur multimédia",
    media_player_helper: "Affiche la lecture en cours, les sources et le volume ; trouvé depuis l'appareil de la télécommande s'il est laissé vide",
    integration: "Intégration",
    integration_auto: "Automatique (détectée)",
    integration_generic: "Lecteur multimédia seul",
    title: "Titre (facultatif, nom de l'appareil par défaut)",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    show_power: "Afficher la touche marche / arrêt",
    show_volume: "Afficher les touches de volume",
    show_channels: "Afficher les touches de chaîne",
    show_transport: "Afficher les touches de lecture",
    show_sources: "Afficher les sources",
    show_apps: "Afficher les applications",
    haptic: "Retour haptique",
    repeat: "Répéter en appui long",
    swipe: "Gestes de balayage sur le pavé directionnel",
    swipe_helper: "Balayez le pavé directionnel pour vous déplacer, touchez pour appuyer sur la touche sous votre doigt",
    language: "Langue",
    lang_auto: "Automatique",
    zoom: "Bouton détail",
    zoom_helper: "Bouton en haut à droite qui déplie la mini-carte en télécommande complète et inversement",
    zoom_in: "Afficher la télécommande complète",
    zoom_out: "Afficher la carte compacte",
  },
  de: {
    state_on: "Ein",
    state_off: "Aus",
    state_playing: "Wiedergabe",
    state_paused: "Pausiert",
    state_idle: "Inaktiv",
    state_standby: "Standby",
    state_buffering: "Puffert",
    state_unavailable: "Nicht verfügbar",
    state_unknown: "Unbekannt",
    k_power: "Ein / Aus",
    k_up: "Hoch",
    k_down: "Runter",
    k_left: "Links",
    k_right: "Rechts",
    k_ok: "OK",
    k_back: "Zurück",
    k_home: "Startseite",
    k_menu: "Menü",
    k_volume_up: "Lauter",
    k_volume_down: "Leiser",
    k_mute: "Stumm",
    k_channel_up: "Nächster Sender",
    k_channel_down: "Vorheriger Sender",
    k_play_pause: "Wiedergabe / Pause",
    k_previous: "Zurück",
    k_next: "Weiter",
    volume: "Lautstärke",
    channel: "Sender",
    sources: "Quellen",
    close: "Schließen",
    apps: "Apps",
    sources_apps: "Quellen und Apps",
    no_entity: "Keine Fernbedienung und kein Mediaplayer gefunden. Lege die Fernbedienung (entity) oder den Mediaplayer der Karte fest.",
    unknown_entity: "Entität nicht gefunden",
    entity: "Fernbedienung",
    entity_helper: "Remote-Entität des Fernsehers oder der Box, die die Tasten sendet",
    media_player: "Mediaplayer",
    media_player_helper: "Zeigt die Wiedergabe, die Quellen und die Lautstärke; leer gelassen, wird er über das Gerät der Fernbedienung gefunden",
    integration: "Integration",
    integration_auto: "Automatisch (erkannt)",
    integration_generic: "Nur Mediaplayer",
    title: "Titel (optional, standardmäßig der Gerätename)",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    show_power: "Ein-/Aus-Taste anzeigen",
    show_volume: "Lautstärketasten anzeigen",
    show_channels: "Sendertasten anzeigen",
    show_transport: "Wiedergabetasten anzeigen",
    show_sources: "Quellen anzeigen",
    show_apps: "Apps anzeigen",
    haptic: "Haptisches Feedback",
    repeat: "Bei langem Drücken wiederholen",
    swipe: "Wischgesten auf dem Steuerkreuz",
    swipe_helper: "Auf dem Steuerkreuz wischen, um sich zu bewegen, tippen, um die Taste unter dem Finger zu drücken",
    language: "Sprache",
    lang_auto: "Automatisch",
    zoom: "Detailschaltfläche",
    zoom_helper: "Schaltfläche oben rechts, die die Mini-Karte zur vollständigen Fernbedienung aufklappt und zurück",
    zoom_in: "Vollständige Fernbedienung anzeigen",
    zoom_out: "Kompakte Karte anzeigen",
  },
  es: {
    state_on: "Encendido",
    state_off: "Apagado",
    state_playing: "Reproduciendo",
    state_paused: "En pausa",
    state_idle: "Inactivo",
    state_standby: "En espera",
    state_buffering: "Cargando",
    state_unavailable: "No disponible",
    state_unknown: "Desconocido",
    k_power: "Encendido / apagado",
    k_up: "Arriba",
    k_down: "Abajo",
    k_left: "Izquierda",
    k_right: "Derecha",
    k_ok: "OK",
    k_back: "Atrás",
    k_home: "Inicio",
    k_menu: "Menú",
    k_volume_up: "Subir volumen",
    k_volume_down: "Bajar volumen",
    k_mute: "Silencio",
    k_channel_up: "Canal siguiente",
    k_channel_down: "Canal anterior",
    k_play_pause: "Reproducir / pausa",
    k_previous: "Anterior",
    k_next: "Siguiente",
    volume: "Volumen",
    channel: "Canal",
    sources: "Fuentes",
    close: "Cerrar",
    apps: "Aplicaciones",
    sources_apps: "Fuentes y aplicaciones",
    no_entity: "No se ha encontrado ningún mando ni reproductor multimedia. Indica el mando (entity) o el reproductor multimedia de la tarjeta.",
    unknown_entity: "Entidad no encontrada",
    entity: "Mando",
    entity_helper: "Entidad remote del televisor o del decodificador, que envía las teclas",
    media_player: "Reproductor multimedia",
    media_player_helper: "Muestra lo que se reproduce, las fuentes y el volumen; si se deja vacío, se busca en el dispositivo del mando",
    integration: "Integración",
    integration_auto: "Automática (detectada)",
    integration_generic: "Solo reproductor multimedia",
    title: "Título (opcional, por defecto el nombre del dispositivo)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    show_power: "Mostrar la tecla de encendido",
    show_volume: "Mostrar las teclas de volumen",
    show_channels: "Mostrar las teclas de canal",
    show_transport: "Mostrar las teclas de reproducción",
    show_sources: "Mostrar las fuentes",
    show_apps: "Mostrar las aplicaciones",
    haptic: "Respuesta háptica",
    repeat: "Repetir al mantener pulsado",
    swipe: "Gestos de deslizamiento en el pad direccional",
    swipe_helper: "Desliza sobre el pad direccional para moverte, toca para pulsar la tecla bajo el dedo",
    language: "Idioma",
    lang_auto: "Automático",
    zoom: "Botón de detalle",
    zoom_helper: "Botón arriba a la derecha que despliega la minitarjeta en el mando completo y viceversa",
    zoom_in: "Mostrar el mando completo",
    zoom_out: "Mostrar la tarjeta compacta",
  },
  it: {
    state_on: "Acceso",
    state_off: "Spento",
    state_playing: "In riproduzione",
    state_paused: "In pausa",
    state_idle: "Inattivo",
    state_standby: "Standby",
    state_buffering: "Buffering",
    state_unavailable: "Non disponibile",
    state_unknown: "Sconosciuto",
    k_power: "Accensione",
    k_up: "Su",
    k_down: "Giù",
    k_left: "Sinistra",
    k_right: "Destra",
    k_ok: "OK",
    k_back: "Indietro",
    k_home: "Home",
    k_menu: "Menu",
    k_volume_up: "Volume su",
    k_volume_down: "Volume giù",
    k_mute: "Muto",
    k_channel_up: "Canale successivo",
    k_channel_down: "Canale precedente",
    k_play_pause: "Play / pausa",
    k_previous: "Precedente",
    k_next: "Successivo",
    volume: "Volume",
    channel: "Canale",
    sources: "Sorgenti",
    close: "Chiudi",
    apps: "App",
    sources_apps: "Sorgenti e app",
    no_entity: "Nessun telecomando o lettore multimediale trovato. Imposta il telecomando (entity) o il lettore multimediale della scheda.",
    unknown_entity: "Entità non trovata",
    entity: "Telecomando",
    entity_helper: "Entità remote della TV o del box, che invia i tasti",
    media_player: "Lettore multimediale",
    media_player_helper: "Mostra la riproduzione, le sorgenti e il volume; se vuoto viene cercato nel dispositivo del telecomando",
    integration: "Integrazione",
    integration_auto: "Automatica (rilevata)",
    integration_generic: "Solo lettore multimediale",
    title: "Titolo (facoltativo, predefinito il nome del dispositivo)",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    show_power: "Mostra il tasto di accensione",
    show_volume: "Mostra i tasti del volume",
    show_channels: "Mostra i tasti dei canali",
    show_transport: "Mostra i tasti di riproduzione",
    show_sources: "Mostra le sorgenti",
    show_apps: "Mostra le app",
    haptic: "Feedback aptico",
    repeat: "Ripeti con pressione prolungata",
    swipe: "Gesti di scorrimento sul pad direzionale",
    swipe_helper: "Scorri sul pad direzionale per spostarti, tocca per premere il tasto sotto il dito",
    language: "Lingua",
    lang_auto: "Automatica",
    zoom: "Pulsante dettaglio",
    zoom_helper: "Pulsante in alto a destra che apre la mini scheda nel telecomando completo e viceversa",
    zoom_in: "Mostra il telecomando completo",
    zoom_out: "Mostra la scheda compatta",
  },
  nl: {
    state_on: "Aan",
    state_off: "Uit",
    state_playing: "Speelt af",
    state_paused: "Gepauzeerd",
    state_idle: "Inactief",
    state_standby: "Stand-by",
    state_buffering: "Bufferen",
    state_unavailable: "Niet beschikbaar",
    state_unknown: "Onbekend",
    k_power: "Aan / uit",
    k_up: "Omhoog",
    k_down: "Omlaag",
    k_left: "Links",
    k_right: "Rechts",
    k_ok: "OK",
    k_back: "Terug",
    k_home: "Start",
    k_menu: "Menu",
    k_volume_up: "Volume omhoog",
    k_volume_down: "Volume omlaag",
    k_mute: "Dempen",
    k_channel_up: "Volgende zender",
    k_channel_down: "Vorige zender",
    k_play_pause: "Afspelen / pauzeren",
    k_previous: "Vorige",
    k_next: "Volgende",
    volume: "Volume",
    channel: "Zender",
    sources: "Bronnen",
    close: "Sluiten",
    apps: "Apps",
    sources_apps: "Bronnen en apps",
    no_entity: "Geen afstandsbediening of mediaspeler gevonden. Stel de afstandsbediening (entity) of de mediaspeler van de kaart in.",
    unknown_entity: "Entiteit niet gevonden",
    entity: "Afstandsbediening",
    entity_helper: "Remote-entiteit van de tv of het kastje, die de toetsen verstuurt",
    media_player: "Mediaspeler",
    media_player_helper: "Toont wat er speelt, de bronnen en het volume; leeg gelaten wordt hij gezocht via het apparaat van de afstandsbediening",
    integration: "Integratie",
    integration_auto: "Automatisch (gedetecteerd)",
    integration_generic: "Alleen mediaspeler",
    title: "Titel (optioneel, standaard de apparaatnaam)",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    show_power: "Aan/uit-toets tonen",
    show_volume: "Volumetoetsen tonen",
    show_channels: "Zendertoetsen tonen",
    show_transport: "Afspeeltoetsen tonen",
    show_sources: "Bronnen tonen",
    show_apps: "Apps tonen",
    haptic: "Haptische feedback",
    repeat: "Herhalen bij lang indrukken",
    swipe: "Veeggebaren op de richtingtoetsen",
    swipe_helper: "Veeg over de richtingtoetsen om te bewegen, tik om de toets onder je vinger in te drukken",
    language: "Taal",
    lang_auto: "Automatisch",
    zoom: "Detailknop",
    zoom_helper: "Knop rechtsboven die de minikaart uitklapt tot de volledige afstandsbediening en terug",
    zoom_in: "Volledige afstandsbediening tonen",
    zoom_out: "Compacte kaart tonen",
  },
  pt: {
    state_on: "Ligado",
    state_off: "Desligado",
    state_playing: "A reproduzir",
    state_paused: "Em pausa",
    state_idle: "Inativo",
    state_standby: "Em espera",
    state_buffering: "A carregar",
    state_unavailable: "Indisponível",
    state_unknown: "Desconhecido",
    k_power: "Ligar / desligar",
    k_up: "Cima",
    k_down: "Baixo",
    k_left: "Esquerda",
    k_right: "Direita",
    k_ok: "OK",
    k_back: "Voltar",
    k_home: "Início",
    k_menu: "Menu",
    k_volume_up: "Aumentar volume",
    k_volume_down: "Diminuir volume",
    k_mute: "Silenciar",
    k_channel_up: "Canal seguinte",
    k_channel_down: "Canal anterior",
    k_play_pause: "Reproduzir / pausa",
    k_previous: "Anterior",
    k_next: "Seguinte",
    volume: "Volume",
    channel: "Canal",
    sources: "Fontes",
    close: "Fechar",
    apps: "Aplicações",
    sources_apps: "Fontes e aplicações",
    no_entity: "Nenhum comando nem leitor multimédia encontrado. Defina o comando (entity) ou o leitor multimédia do cartão.",
    unknown_entity: "Entidade não encontrada",
    entity: "Comando",
    entity_helper: "Entidade remote da TV ou da box, que envia as teclas",
    media_player: "Leitor multimédia",
    media_player_helper: "Mostra o que está a reproduzir, as fontes e o volume; se ficar vazio, é procurado no dispositivo do comando",
    integration: "Integração",
    integration_auto: "Automática (detetada)",
    integration_generic: "Apenas leitor multimédia",
    title: "Título (opcional, por omissão o nome do dispositivo)",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    show_power: "Mostrar a tecla ligar / desligar",
    show_volume: "Mostrar as teclas de volume",
    show_channels: "Mostrar as teclas de canal",
    show_transport: "Mostrar as teclas de reprodução",
    show_sources: "Mostrar as fontes",
    show_apps: "Mostrar as aplicações",
    haptic: "Resposta háptica",
    repeat: "Repetir ao manter premido",
    swipe: "Gestos de deslizar no direcional",
    swipe_helper: "Deslize no direcional para se mover, toque para premir a tecla sob o dedo",
    language: "Idioma",
    lang_auto: "Automático",
    zoom: "Botão de detalhe",
    zoom_helper: "Botão no canto superior direito que abre o mini cartão no comando completo e vice-versa",
    zoom_in: "Mostrar o comando completo",
    zoom_out: "Mostrar o cartão compacto",
  },
  pl: {
    state_on: "Włączony",
    state_off: "Wyłączony",
    state_playing: "Odtwarzanie",
    state_paused: "Wstrzymany",
    state_idle: "Bezczynny",
    state_standby: "Czuwanie",
    state_buffering: "Buforowanie",
    state_unavailable: "Niedostępny",
    state_unknown: "Nieznany",
    k_power: "Zasilanie",
    k_up: "W górę",
    k_down: "W dół",
    k_left: "W lewo",
    k_right: "W prawo",
    k_ok: "OK",
    k_back: "Wstecz",
    k_home: "Ekran główny",
    k_menu: "Menu",
    k_volume_up: "Głośniej",
    k_volume_down: "Ciszej",
    k_mute: "Wycisz",
    k_channel_up: "Następny kanał",
    k_channel_down: "Poprzedni kanał",
    k_play_pause: "Odtwórz / pauza",
    k_previous: "Poprzedni",
    k_next: "Następny",
    volume: "Głośność",
    channel: "Kanał",
    sources: "Źródła",
    close: "Zamknij",
    apps: "Aplikacje",
    sources_apps: "Źródła i aplikacje",
    no_entity: "Nie znaleziono pilota ani odtwarzacza multimediów. Ustaw pilota (entity) lub odtwarzacz multimediów karty.",
    unknown_entity: "Nie znaleziono encji",
    entity: "Pilot",
    entity_helper: "Encja remote telewizora lub przystawki, która wysyła klawisze",
    media_player: "Odtwarzacz multimediów",
    media_player_helper: "Pokazuje, co jest odtwarzane, źródła i głośność; gdy puste, jest wyszukiwany w urządzeniu pilota",
    integration: "Integracja",
    integration_auto: "Automatyczna (wykryta)",
    integration_generic: "Tylko odtwarzacz multimediów",
    title: "Tytuł (opcjonalny, domyślnie nazwa urządzenia)",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    show_power: "Pokaż przycisk zasilania",
    show_volume: "Pokaż przyciski głośności",
    show_channels: "Pokaż przyciski kanałów",
    show_transport: "Pokaż przyciski odtwarzania",
    show_sources: "Pokaż źródła",
    show_apps: "Pokaż aplikacje",
    haptic: "Wibracje",
    repeat: "Powtarzaj przy długim naciśnięciu",
    swipe: "Gesty przesuwania na krzyżaku",
    swipe_helper: "Przesuń po krzyżaku, aby się poruszać, dotknij, aby nacisnąć klawisz pod palcem",
    language: "Język",
    lang_auto: "Automatyczny",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przycisk w prawym górnym rogu rozwijający minikartę do pełnego pilota i z powrotem",
    zoom_in: "Pokaż pełnego pilota",
    zoom_out: "Pokaż kompaktową kartę",
  },
  sr: {
    state_on: "Укључено",
    state_off: "Искључено",
    state_playing: "Репродукција",
    state_paused: "Паузирано",
    state_idle: "Неактивно",
    state_standby: "Приправност",
    state_buffering: "Баферовање",
    state_unavailable: "Недоступно",
    state_unknown: "Непознато",
    k_power: "Укључи / искључи",
    k_up: "Горе",
    k_down: "Доле",
    k_left: "Лево",
    k_right: "Десно",
    k_ok: "OK",
    k_back: "Назад",
    k_home: "Почетна",
    k_menu: "Мени",
    k_volume_up: "Појачај",
    k_volume_down: "Утишај",
    k_mute: "Без звука",
    k_channel_up: "Следећи канал",
    k_channel_down: "Претходни канал",
    k_play_pause: "Пусти / пауза",
    k_previous: "Претходно",
    k_next: "Следеће",
    volume: "Јачина звука",
    channel: "Канал",
    sources: "Извори",
    close: "Затвори",
    apps: "Апликације",
    sources_apps: "Извори и апликације",
    no_entity: "Није пронађен ниједан даљински управљач ни медија плејер. Подесите даљински (entity) или медија плејер картице.",
    unknown_entity: "Ентитет није пронађен",
    entity: "Даљински управљач",
    entity_helper: "Remote ентитет телевизора или уређаја, који шаље тастере",
    media_player: "Медија плејер",
    media_player_helper: "Приказује шта се репродукује, изворе и јачину звука; ако је празно, тражи се на уређају даљинског",
    integration: "Интеграција",
    integration_auto: "Аутоматски (откривено)",
    integration_generic: "Само медија плејер",
    title: "Наслов (опционо, подразумевано назив уређаја)",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    show_power: "Прикажи тастер за укључивање",
    show_volume: "Прикажи тастере за јачину звука",
    show_channels: "Прикажи тастере за канале",
    show_transport: "Прикажи тастере за репродукцију",
    show_sources: "Прикажи изворе",
    show_apps: "Прикажи апликације",
    haptic: "Хаптички одзив",
    repeat: "Понављај при дугом притиску",
    swipe: "Покрети превлачења на смерној табли",
    swipe_helper: "Превуците по смерној табли за кретање, додирните да притиснете тастер испод прста",
    language: "Језик",
    lang_auto: "Аутоматски",
    zoom: "Дугме за детаље",
    zoom_helper: "Дугме горе десно које отвара мини картицу у пун даљински и назад",
    zoom_in: "Прикажи пун даљински",
    zoom_out: "Прикажи компактну картицу",
  },
  "sr-Latn": {
    state_on: "Uključeno",
    state_off: "Isključeno",
    state_playing: "Reprodukcija",
    state_paused: "Pauzirano",
    state_idle: "Neaktivno",
    state_standby: "Pripravnost",
    state_buffering: "Baferovanje",
    state_unavailable: "Nedostupno",
    state_unknown: "Nepoznato",
    k_power: "Uključi / isključi",
    k_up: "Gore",
    k_down: "Dole",
    k_left: "Levo",
    k_right: "Desno",
    k_ok: "OK",
    k_back: "Nazad",
    k_home: "Početna",
    k_menu: "Meni",
    k_volume_up: "Pojačaj",
    k_volume_down: "Utišaj",
    k_mute: "Bez zvuka",
    k_channel_up: "Sledeći kanal",
    k_channel_down: "Prethodni kanal",
    k_play_pause: "Pusti / pauza",
    k_previous: "Prethodno",
    k_next: "Sledeće",
    volume: "Jačina zvuka",
    channel: "Kanal",
    sources: "Izvori",
    close: "Zatvori",
    apps: "Aplikacije",
    sources_apps: "Izvori i aplikacije",
    no_entity: "Nije pronađen nijedan daljinski upravljač ni medija plejer. Podesite daljinski (entity) ili medija plejer kartice.",
    unknown_entity: "Entitet nije pronađen",
    entity: "Daljinski upravljač",
    entity_helper: "Remote entitet televizora ili uređaja, koji šalje tastere",
    media_player: "Medija plejer",
    media_player_helper: "Prikazuje šta se reprodukuje, izvore i jačinu zvuka; ako je prazno, traži se na uređaju daljinskog",
    integration: "Integracija",
    integration_auto: "Automatski (otkriveno)",
    integration_generic: "Samo medija plejer",
    title: "Naslov (opciono, podrazumevano naziv uređaja)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_power: "Prikaži taster za uključivanje",
    show_volume: "Prikaži tastere za jačinu zvuka",
    show_channels: "Prikaži tastere za kanale",
    show_transport: "Prikaži tastere za reprodukciju",
    show_sources: "Prikaži izvore",
    show_apps: "Prikaži aplikacije",
    haptic: "Haptički odziv",
    repeat: "Ponavljaj pri dugom pritisku",
    swipe: "Pokreti prevlačenja na smernoj tabli",
    swipe_helper: "Prevucite po smernoj tabli za kretanje, dodirnite da pritisnete taster ispod prsta",
    language: "Jezik",
    lang_auto: "Automatski",
    zoom: "Dugme za detalje",
    zoom_helper: "Dugme gore desno koje otvara mini karticu u pun daljinski i nazad",
    zoom_in: "Prikaži pun daljinski",
    zoom_out: "Prikaži kompaktnu karticu",
  },
  ro: {
    state_on: "Pornit",
    state_off: "Oprit",
    state_playing: "Redare",
    state_paused: "În pauză",
    state_idle: "Inactiv",
    state_standby: "În așteptare",
    state_buffering: "Se încarcă",
    state_unavailable: "Indisponibil",
    state_unknown: "Necunoscut",
    k_power: "Pornire / oprire",
    k_up: "Sus",
    k_down: "Jos",
    k_left: "Stânga",
    k_right: "Dreapta",
    k_ok: "OK",
    k_back: "Înapoi",
    k_home: "Acasă",
    k_menu: "Meniu",
    k_volume_up: "Volum +",
    k_volume_down: "Volum −",
    k_mute: "Fără sunet",
    k_channel_up: "Canalul următor",
    k_channel_down: "Canalul anterior",
    k_play_pause: "Redare / pauză",
    k_previous: "Anterior",
    k_next: "Următor",
    volume: "Volum",
    channel: "Canal",
    sources: "Surse",
    close: "Închide",
    apps: "Aplicații",
    sources_apps: "Surse și aplicații",
    no_entity: "Nu a fost găsită nicio telecomandă și niciun player media. Setați telecomanda (entity) sau playerul media al cardului.",
    unknown_entity: "Entitate negăsită",
    entity: "Telecomandă",
    entity_helper: "Entitatea remote a televizorului sau a boxei, care trimite tastele",
    media_player: "Player media",
    media_player_helper: "Arată ce se redă, sursele și volumul; dacă e lăsat gol, este căutat pe dispozitivul telecomenzii",
    integration: "Integrare",
    integration_auto: "Automată (detectată)",
    integration_generic: "Doar player media",
    title: "Titlu (opțional, implicit numele dispozitivului)",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    show_power: "Afișează tasta de pornire",
    show_volume: "Afișează tastele de volum",
    show_channels: "Afișează tastele de canal",
    show_transport: "Afișează tastele de redare",
    show_sources: "Afișează sursele",
    show_apps: "Afișează aplicațiile",
    haptic: "Feedback haptic",
    repeat: "Repetă la apăsare lungă",
    swipe: "Gesturi de glisare pe pad-ul direcțional",
    swipe_helper: "Glisați pe pad-ul direcțional pentru a vă deplasa, atingeți pentru a apăsa tasta de sub deget",
    language: "Limbă",
    lang_auto: "Automat",
    zoom: "Buton detalii",
    zoom_helper: "Buton din dreapta sus care desfășoară mini cardul în telecomanda completă și înapoi",
    zoom_in: "Afișează telecomanda completă",
    zoom_out: "Afișează cardul compact",
  },
  da: {
    state_on: "Tændt",
    state_off: "Slukket",
    state_playing: "Afspiller",
    state_paused: "Sat på pause",
    state_idle: "Inaktiv",
    state_standby: "Standby",
    state_buffering: "Buffer",
    state_unavailable: "Utilgængelig",
    state_unknown: "Ukendt",
    k_power: "Tænd / sluk",
    k_up: "Op",
    k_down: "Ned",
    k_left: "Venstre",
    k_right: "Højre",
    k_ok: "OK",
    k_back: "Tilbage",
    k_home: "Hjem",
    k_menu: "Menu",
    k_volume_up: "Lydstyrke op",
    k_volume_down: "Lydstyrke ned",
    k_mute: "Lyd fra",
    k_channel_up: "Næste kanal",
    k_channel_down: "Forrige kanal",
    k_play_pause: "Afspil / pause",
    k_previous: "Forrige",
    k_next: "Næste",
    volume: "Lydstyrke",
    channel: "Kanal",
    sources: "Kilder",
    close: "Luk",
    apps: "Apps",
    sources_apps: "Kilder og apps",
    no_entity: "Ingen fjernbetjening eller medieafspiller fundet. Angiv kortets fjernbetjening (entity) eller medieafspiller.",
    unknown_entity: "Entitet ikke fundet",
    entity: "Fjernbetjening",
    entity_helper: "Remote-entiteten for tv'et eller boksen, som sender tasterne",
    media_player: "Medieafspiller",
    media_player_helper: "Viser, hvad der afspilles, kilderne og lydstyrken; findes via fjernbetjeningens enhed, hvis feltet er tomt",
    integration: "Integration",
    integration_auto: "Automatisk (registreret)",
    integration_generic: "Kun medieafspiller",
    title: "Titel (valgfri, som standard enhedens navn)",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    show_power: "Vis tænd/sluk-tasten",
    show_volume: "Vis lydstyrketasterne",
    show_channels: "Vis kanaltasterne",
    show_transport: "Vis afspilningstasterne",
    show_sources: "Vis kilderne",
    show_apps: "Vis apps",
    haptic: "Haptisk feedback",
    repeat: "Gentag ved langt tryk",
    swipe: "Strygebevægelser på retningstasterne",
    swipe_helper: "Stryg på retningstasterne for at flytte, tryk for at trykke på tasten under fingeren",
    language: "Sprog",
    lang_auto: "Automatisk",
    zoom: "Detaljeknap",
    zoom_helper: "Knap øverst til højre, der folder minikortet ud til den fulde fjernbetjening og tilbage",
    zoom_in: "Vis den fulde fjernbetjening",
    zoom_out: "Vis det kompakte kort",
  },
  sv: {
    state_on: "På",
    state_off: "Av",
    state_playing: "Spelar",
    state_paused: "Pausad",
    state_idle: "Inaktiv",
    state_standby: "Viloläge",
    state_buffering: "Buffrar",
    state_unavailable: "Inte tillgänglig",
    state_unknown: "Okänd",
    k_power: "På / av",
    k_up: "Upp",
    k_down: "Ned",
    k_left: "Vänster",
    k_right: "Höger",
    k_ok: "OK",
    k_back: "Tillbaka",
    k_home: "Hem",
    k_menu: "Meny",
    k_volume_up: "Volym upp",
    k_volume_down: "Volym ned",
    k_mute: "Ljud av",
    k_channel_up: "Nästa kanal",
    k_channel_down: "Föregående kanal",
    k_play_pause: "Spela / pausa",
    k_previous: "Föregående",
    k_next: "Nästa",
    volume: "Volym",
    channel: "Kanal",
    sources: "Källor",
    close: "Stäng",
    apps: "Appar",
    sources_apps: "Källor och appar",
    no_entity: "Ingen fjärrkontroll eller mediaspelare hittades. Ange kortets fjärrkontroll (entity) eller mediaspelare.",
    unknown_entity: "Entiteten hittades inte",
    entity: "Fjärrkontroll",
    entity_helper: "Remote-entitet för tv:n eller boxen, som skickar knapparna",
    media_player: "Mediaspelare",
    media_player_helper: "Visar vad som spelas, källorna och volymen; hittas via fjärrkontrollens enhet om fältet lämnas tomt",
    integration: "Integration",
    integration_auto: "Automatisk (identifierad)",
    integration_generic: "Endast mediaspelare",
    title: "Titel (valfri, som standard enhetens namn)",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    show_power: "Visa på/av-knappen",
    show_volume: "Visa volymknapparna",
    show_channels: "Visa kanalknapparna",
    show_transport: "Visa uppspelningsknapparna",
    show_sources: "Visa källorna",
    show_apps: "Visa appar",
    haptic: "Haptisk återkoppling",
    repeat: "Upprepa vid långt tryck",
    swipe: "Svepgester på styrkorset",
    swipe_helper: "Svep på styrkorset för att flytta, tryck för att trycka på knappen under fingret",
    language: "Språk",
    lang_auto: "Automatiskt",
    zoom: "Detaljknapp",
    zoom_helper: "Knapp uppe till höger som fäller ut minikortet till hela fjärrkontrollen och tillbaka",
    zoom_in: "Visa hela fjärrkontrollen",
    zoom_out: "Visa det kompakta kortet",
  },
  bg: {
    state_on: "Включено",
    state_off: "Изключено",
    state_playing: "Възпроизвеждане",
    state_paused: "На пауза",
    state_idle: "Неактивно",
    state_standby: "Режим на готовност",
    state_buffering: "Буфериране",
    state_unavailable: "Недостъпно",
    state_unknown: "Неизвестно",
    k_power: "Вкл. / изкл.",
    k_up: "Нагоре",
    k_down: "Надолу",
    k_left: "Наляво",
    k_right: "Надясно",
    k_ok: "OK",
    k_back: "Назад",
    k_home: "Начало",
    k_menu: "Меню",
    k_volume_up: "Увеличи звука",
    k_volume_down: "Намали звука",
    k_mute: "Без звук",
    k_channel_up: "Следващ канал",
    k_channel_down: "Предишен канал",
    k_play_pause: "Пусни / пауза",
    k_previous: "Предишно",
    k_next: "Следващо",
    volume: "Сила на звука",
    channel: "Канал",
    sources: "Източници",
    close: "Затвори",
    apps: "Приложения",
    sources_apps: "Източници и приложения",
    no_entity: "Не е намерено дистанционно или медиен плейър. Задайте дистанционното (entity) или медийния плейър на картата.",
    unknown_entity: "Обектът не е намерен",
    entity: "Дистанционно",
    entity_helper: "Remote обект на телевизора или приемника, който изпраща бутоните",
    media_player: "Медиен плейър",
    media_player_helper: "Показва какво се възпроизвежда, източниците и силата на звука; ако е празно, се търси в устройството на дистанционното",
    integration: "Интеграция",
    integration_auto: "Автоматично (открита)",
    integration_generic: "Само медиен плейър",
    title: "Заглавие (по избор, по подразбиране името на устройството)",
    show_title: "Показване на заглавието",
    show_subtitle: "Показване на подзаглавието",
    show_power: "Показване на бутона за включване",
    show_volume: "Показване на бутоните за звука",
    show_channels: "Показване на бутоните за канали",
    show_transport: "Показване на бутоните за възпроизвеждане",
    show_sources: "Показване на източниците",
    show_apps: "Показване на приложенията",
    haptic: "Хаптична обратна връзка",
    repeat: "Повтаряне при задържане",
    swipe: "Жестове с плъзгане по кръстачката",
    swipe_helper: "Плъзнете по кръстачката, за да се придвижите, докоснете, за да натиснете бутона под пръста",
    language: "Език",
    lang_auto: "Автоматично",
    zoom: "Бутон за детайли",
    zoom_helper: "Бутон горе вдясно, който разгъва мини картата в пълното дистанционно и обратно",
    zoom_in: "Покажи пълното дистанционно",
    zoom_out: "Покажи компактната карта",
  },
  ru: {
    state_on: "Включено",
    state_off: "Выключено",
    state_playing: "Воспроизведение",
    state_paused: "Пауза",
    state_idle: "Бездействие",
    state_standby: "Ожидание",
    state_buffering: "Буферизация",
    state_unavailable: "Недоступно",
    state_unknown: "Неизвестно",
    k_power: "Питание",
    k_up: "Вверх",
    k_down: "Вниз",
    k_left: "Влево",
    k_right: "Вправо",
    k_ok: "OK",
    k_back: "Назад",
    k_home: "Домой",
    k_menu: "Меню",
    k_volume_up: "Громче",
    k_volume_down: "Тише",
    k_mute: "Без звука",
    k_channel_up: "Следующий канал",
    k_channel_down: "Предыдущий канал",
    k_play_pause: "Воспроизведение / пауза",
    k_previous: "Предыдущий",
    k_next: "Следующий",
    volume: "Громкость",
    channel: "Канал",
    sources: "Источники",
    close: "Закрыть",
    apps: "Приложения",
    sources_apps: "Источники и приложения",
    no_entity: "Не найдено ни пульта, ни медиаплеера. Укажите пульт (entity) или медиаплеер карточки.",
    unknown_entity: "Объект не найден",
    entity: "Пульт",
    entity_helper: "Объект remote телевизора или приставки, который отправляет кнопки",
    media_player: "Медиаплеер",
    media_player_helper: "Показывает, что воспроизводится, источники и громкость; если не задан, ищется на устройстве пульта",
    integration: "Интеграция",
    integration_auto: "Автоматически (определена)",
    integration_generic: "Только медиаплеер",
    title: "Заголовок (необязательно, по умолчанию имя устройства)",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    show_power: "Показывать кнопку питания",
    show_volume: "Показывать кнопки громкости",
    show_channels: "Показывать кнопки каналов",
    show_transport: "Показывать кнопки воспроизведения",
    show_sources: "Показывать источники",
    show_apps: "Показывать приложения",
    haptic: "Тактильный отклик",
    repeat: "Повтор при долгом нажатии",
    swipe: "Жесты смахивания на крестовине",
    swipe_helper: "Проведите по крестовине для перемещения, коснитесь, чтобы нажать кнопку под пальцем",
    language: "Язык",
    lang_auto: "Автоматически",
    zoom: "Кнопка подробностей",
    zoom_helper: "Кнопка в правом верхнем углу, раскрывающая мини-карточку в полный пульт и обратно",
    zoom_in: "Показать полный пульт",
    zoom_out: "Показать компактную карточку",
  },
  uk: {
    state_on: "Увімкнено",
    state_off: "Вимкнено",
    state_playing: "Відтворення",
    state_paused: "Пауза",
    state_idle: "Бездіяльність",
    state_standby: "Очікування",
    state_buffering: "Буферизація",
    state_unavailable: "Недоступно",
    state_unknown: "Невідомо",
    k_power: "Живлення",
    k_up: "Вгору",
    k_down: "Вниз",
    k_left: "Ліворуч",
    k_right: "Праворуч",
    k_ok: "OK",
    k_back: "Назад",
    k_home: "Додому",
    k_menu: "Меню",
    k_volume_up: "Гучніше",
    k_volume_down: "Тихіше",
    k_mute: "Без звуку",
    k_channel_up: "Наступний канал",
    k_channel_down: "Попередній канал",
    k_play_pause: "Відтворення / пауза",
    k_previous: "Попередній",
    k_next: "Наступний",
    volume: "Гучність",
    channel: "Канал",
    sources: "Джерела",
    close: "Закрити",
    apps: "Застосунки",
    sources_apps: "Джерела та застосунки",
    no_entity: "Не знайдено ні пульта, ні медіапрогравача. Вкажіть пульт (entity) або медіапрогравач картки.",
    unknown_entity: "Об'єкт не знайдено",
    entity: "Пульт",
    entity_helper: "Об'єкт remote телевізора чи приставки, що надсилає кнопки",
    media_player: "Медіапрогравач",
    media_player_helper: "Показує, що відтворюється, джерела й гучність; якщо порожньо, шукається на пристрої пульта",
    integration: "Інтеграція",
    integration_auto: "Автоматично (визначена)",
    integration_generic: "Лише медіапрогравач",
    title: "Заголовок (необов'язково, типово назва пристрою)",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    show_power: "Показувати кнопку живлення",
    show_volume: "Показувати кнопки гучності",
    show_channels: "Показувати кнопки каналів",
    show_transport: "Показувати кнопки відтворення",
    show_sources: "Показувати джерела",
    show_apps: "Показувати застосунки",
    haptic: "Тактильний відгук",
    repeat: "Повторювати при довгому натисканні",
    swipe: "Жести гортання на хрестовині",
    swipe_helper: "Проведіть по хрестовині для переміщення, торкніться, щоб натиснути кнопку під пальцем",
    language: "Мова",
    lang_auto: "Автоматично",
    zoom: "Кнопка деталей",
    zoom_helper: "Кнопка вгорі праворуч, що розгортає міні-картку в повний пульт і назад",
    zoom_in: "Показати повний пульт",
    zoom_out: "Показати компактну картку",
  },
  hu: {
    state_on: "Be",
    state_off: "Ki",
    state_playing: "Lejátszás",
    state_paused: "Szüneteltetve",
    state_idle: "Tétlen",
    state_standby: "Készenlét",
    state_buffering: "Pufferelés",
    state_unavailable: "Nem elérhető",
    state_unknown: "Ismeretlen",
    k_power: "Be / ki",
    k_up: "Fel",
    k_down: "Le",
    k_left: "Balra",
    k_right: "Jobbra",
    k_ok: "OK",
    k_back: "Vissza",
    k_home: "Kezdőlap",
    k_menu: "Menü",
    k_volume_up: "Hangerő fel",
    k_volume_down: "Hangerő le",
    k_mute: "Némítás",
    k_channel_up: "Következő csatorna",
    k_channel_down: "Előző csatorna",
    k_play_pause: "Lejátszás / szünet",
    k_previous: "Előző",
    k_next: "Következő",
    volume: "Hangerő",
    channel: "Csatorna",
    sources: "Források",
    close: "Bezárás",
    apps: "Alkalmazások",
    sources_apps: "Források és alkalmazások",
    no_entity: "Nem található távirányító vagy médialejátszó. Adja meg a kártya távirányítóját (entity) vagy médialejátszóját.",
    unknown_entity: "Az entitás nem található",
    entity: "Távirányító",
    entity_helper: "A tévé vagy a set-top box remote entitása, amely a gombokat küldi",
    media_player: "Médialejátszó",
    media_player_helper: "Megmutatja, mi szól, a forrásokat és a hangerőt; üresen hagyva a távirányító eszközén keresi",
    integration: "Integráció",
    integration_auto: "Automatikus (felismert)",
    integration_generic: "Csak médialejátszó",
    title: "Cím (opcionális, alapértelmezés szerint az eszköz neve)",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    show_power: "Be/ki gomb megjelenítése",
    show_volume: "Hangerőgombok megjelenítése",
    show_channels: "Csatornagombok megjelenítése",
    show_transport: "Lejátszásvezérlő gombok megjelenítése",
    show_sources: "Források megjelenítése",
    show_apps: "Alkalmazások megjelenítése",
    haptic: "Haptikus visszajelzés",
    repeat: "Ismétlés hosszú nyomásra",
    swipe: "Húzó mozdulatok a navigációs gombon",
    swipe_helper: "Húzza az ujját a navigációs gombon a mozgáshoz, koppintson az ujja alatti gomb megnyomásához",
    language: "Nyelv",
    lang_auto: "Automatikus",
    zoom: "Részletek gomb",
    zoom_helper: "Jobb felső gomb, amely a mini kártyát a teljes távirányítóvá nyitja és vissza",
    zoom_in: "Teljes távirányító megjelenítése",
    zoom_out: "Kompakt kártya megjelenítése",
  },
  sk: {
    state_on: "Zapnuté",
    state_off: "Vypnuté",
    state_playing: "Prehráva sa",
    state_paused: "Pozastavené",
    state_idle: "Nečinné",
    state_standby: "Pohotovosť",
    state_buffering: "Načítava sa",
    state_unavailable: "Nedostupné",
    state_unknown: "Neznáme",
    k_power: "Zapnúť / vypnúť",
    k_up: "Hore",
    k_down: "Dole",
    k_left: "Doľava",
    k_right: "Doprava",
    k_ok: "OK",
    k_back: "Späť",
    k_home: "Domov",
    k_menu: "Ponuka",
    k_volume_up: "Zvýšiť hlasitosť",
    k_volume_down: "Znížiť hlasitosť",
    k_mute: "Stlmiť",
    k_channel_up: "Ďalší kanál",
    k_channel_down: "Predchádzajúci kanál",
    k_play_pause: "Prehrať / pozastaviť",
    k_previous: "Predchádzajúce",
    k_next: "Ďalšie",
    volume: "Hlasitosť",
    channel: "Kanál",
    sources: "Zdroje",
    close: "Zavrieť",
    apps: "Aplikácie",
    sources_apps: "Zdroje a aplikácie",
    no_entity: "Nenašiel sa žiadny ovládač ani prehrávač médií. Nastavte ovládač (entity) alebo prehrávač médií karty.",
    unknown_entity: "Entita sa nenašla",
    entity: "Diaľkový ovládač",
    entity_helper: "Entita remote televízora alebo setboxu, ktorá posiela tlačidlá",
    media_player: "Prehrávač médií",
    media_player_helper: "Zobrazuje, čo sa prehráva, zdroje a hlasitosť; ak je prázdne, hľadá sa v zariadení ovládača",
    integration: "Integrácia",
    integration_auto: "Automatická (zistená)",
    integration_generic: "Len prehrávač médií",
    title: "Názov (voliteľný, predvolene názov zariadenia)",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnázov",
    show_power: "Zobraziť tlačidlo napájania",
    show_volume: "Zobraziť tlačidlá hlasitosti",
    show_channels: "Zobraziť tlačidlá kanálov",
    show_transport: "Zobraziť tlačidlá prehrávania",
    show_sources: "Zobraziť zdroje",
    show_apps: "Zobraziť aplikácie",
    haptic: "Haptická odozva",
    repeat: "Opakovať pri dlhom stlačení",
    swipe: "Gestá potiahnutia na smerovom ovládači",
    swipe_helper: "Potiahnite po smerovom ovládači na pohyb, ťuknite na stlačenie tlačidla pod prstom",
    language: "Jazyk",
    lang_auto: "Automaticky",
    zoom: "Tlačidlo detailu",
    zoom_helper: "Tlačidlo vpravo hore, ktoré rozbalí minikartu na úplný ovládač a späť",
    zoom_in: "Zobraziť úplný ovládač",
    zoom_out: "Zobraziť kompaktnú kartu",
  },
  cs: {
    state_on: "Zapnuto",
    state_off: "Vypnuto",
    state_playing: "Přehrává se",
    state_paused: "Pozastaveno",
    state_idle: "Nečinné",
    state_standby: "Pohotovost",
    state_buffering: "Načítání",
    state_unavailable: "Nedostupné",
    state_unknown: "Neznámé",
    k_power: "Zapnout / vypnout",
    k_up: "Nahoru",
    k_down: "Dolů",
    k_left: "Doleva",
    k_right: "Doprava",
    k_ok: "OK",
    k_back: "Zpět",
    k_home: "Domů",
    k_menu: "Nabídka",
    k_volume_up: "Zesílit",
    k_volume_down: "Zeslabit",
    k_mute: "Ztlumit",
    k_channel_up: "Další kanál",
    k_channel_down: "Předchozí kanál",
    k_play_pause: "Přehrát / pozastavit",
    k_previous: "Předchozí",
    k_next: "Další",
    volume: "Hlasitost",
    channel: "Kanál",
    sources: "Zdroje",
    close: "Zavřít",
    apps: "Aplikace",
    sources_apps: "Zdroje a aplikace",
    no_entity: "Nenalezen žádný ovladač ani přehrávač médií. Nastavte ovladač (entity) nebo přehrávač médií karty.",
    unknown_entity: "Entita nenalezena",
    entity: "Dálkový ovladač",
    entity_helper: "Entita remote televize nebo set-top boxu, která posílá tlačítka",
    media_player: "Přehrávač médií",
    media_player_helper: "Zobrazuje, co se přehrává, zdroje a hlasitost; pokud je prázdné, hledá se v zařízení ovladače",
    integration: "Integrace",
    integration_auto: "Automatická (zjištěná)",
    integration_generic: "Pouze přehrávač médií",
    title: "Název (volitelný, výchozí je název zařízení)",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podnázev",
    show_power: "Zobrazit tlačítko napájení",
    show_volume: "Zobrazit tlačítka hlasitosti",
    show_channels: "Zobrazit tlačítka kanálů",
    show_transport: "Zobrazit tlačítka přehrávání",
    show_sources: "Zobrazit zdroje",
    show_apps: "Zobrazit aplikace",
    haptic: "Haptická odezva",
    repeat: "Opakovat při dlouhém stisku",
    swipe: "Gesta přejetí na směrovém ovladači",
    swipe_helper: "Přejeďte po směrovém ovladači pro pohyb, klepněte pro stisk tlačítka pod prstem",
    language: "Jazyk",
    lang_auto: "Automaticky",
    zoom: "Tlačítko detailu",
    zoom_helper: "Tlačítko vpravo nahoře, které rozbalí minikartu na úplný ovladač a zpět",
    zoom_in: "Zobrazit úplný ovladač",
    zoom_out: "Zobrazit kompaktní kartu",
  },
  sl: {
    state_on: "Vklopljeno",
    state_off: "Izklopljeno",
    state_playing: "Predvajanje",
    state_paused: "Zaustavljeno",
    state_idle: "Nedejavno",
    state_standby: "Stanje pripravljenosti",
    state_buffering: "Medpomnjenje",
    state_unavailable: "Ni na voljo",
    state_unknown: "Neznano",
    k_power: "Vklop / izklop",
    k_up: "Gor",
    k_down: "Dol",
    k_left: "Levo",
    k_right: "Desno",
    k_ok: "OK",
    k_back: "Nazaj",
    k_home: "Domov",
    k_menu: "Meni",
    k_volume_up: "Glasneje",
    k_volume_down: "Tiše",
    k_mute: "Utišaj",
    k_channel_up: "Naslednji kanal",
    k_channel_down: "Prejšnji kanal",
    k_play_pause: "Predvajaj / premor",
    k_previous: "Prejšnje",
    k_next: "Naslednje",
    volume: "Glasnost",
    channel: "Kanal",
    sources: "Viri",
    close: "Zapri",
    apps: "Aplikacije",
    sources_apps: "Viri in aplikacije",
    no_entity: "Ni najdenega daljinca ali predvajalnika predstavnosti. Nastavite daljinec (entity) ali predvajalnik predstavnosti kartice.",
    unknown_entity: "Entitete ni mogoče najti",
    entity: "Daljinski upravljalnik",
    entity_helper: "Entiteta remote televizorja ali sprejemnika, ki pošilja tipke",
    media_player: "Predvajalnik predstavnosti",
    media_player_helper: "Prikazuje, kaj se predvaja, vire in glasnost; če je prazno, se poišče na napravi daljinca",
    integration: "Integracija",
    integration_auto: "Samodejno (zaznana)",
    integration_generic: "Samo predvajalnik predstavnosti",
    title: "Naslov (neobvezno, privzeto ime naprave)",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    show_power: "Prikaži tipko za vklop",
    show_volume: "Prikaži tipke za glasnost",
    show_channels: "Prikaži tipke za kanale",
    show_transport: "Prikaži tipke za predvajanje",
    show_sources: "Prikaži vire",
    show_apps: "Prikaži aplikacije",
    haptic: "Haptični odziv",
    repeat: "Ponavljaj ob dolgem pritisku",
    swipe: "Kretnje podrsavanja na smernih tipkah",
    swipe_helper: "Podrsajte po smernih tipkah za premikanje, tapnite za pritisk tipke pod prstom",
    language: "Jezik",
    lang_auto: "Samodejno",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Gumb zgoraj desno, ki razpre mini kartico v poln daljinec in nazaj",
    zoom_in: "Prikaži poln daljinec",
    zoom_out: "Prikaži kompaktno kartico",
  },
  lv: {
    state_on: "Ieslēgts",
    state_off: "Izslēgts",
    state_playing: "Atskaņo",
    state_paused: "Pauzēts",
    state_idle: "Dīkstāvē",
    state_standby: "Gaidstāve",
    state_buffering: "Buferizē",
    state_unavailable: "Nav pieejams",
    state_unknown: "Nezināms",
    k_power: "Ieslēgt / izslēgt",
    k_up: "Augšup",
    k_down: "Lejup",
    k_left: "Pa kreisi",
    k_right: "Pa labi",
    k_ok: "OK",
    k_back: "Atpakaļ",
    k_home: "Sākums",
    k_menu: "Izvēlne",
    k_volume_up: "Skaļāk",
    k_volume_down: "Klusāk",
    k_mute: "Izslēgt skaņu",
    k_channel_up: "Nākamais kanāls",
    k_channel_down: "Iepriekšējais kanāls",
    k_play_pause: "Atskaņot / pauze",
    k_previous: "Iepriekšējais",
    k_next: "Nākamais",
    volume: "Skaļums",
    channel: "Kanāls",
    sources: "Avoti",
    close: "Aizvērt",
    apps: "Lietotnes",
    sources_apps: "Avoti un lietotnes",
    no_entity: "Nav atrasta neviena tālvadības pults vai multivides atskaņotājs. Iestatiet kartes pulti (entity) vai multivides atskaņotāju.",
    unknown_entity: "Entītija nav atrasta",
    entity: "Tālvadības pults",
    entity_helper: "Televizora vai priedēkļa remote entītija, kas sūta taustiņus",
    media_player: "Multivides atskaņotājs",
    media_player_helper: "Rāda, kas tiek atskaņots, avotus un skaļumu; ja tukšs, tiek meklēts pults ierīcē",
    integration: "Integrācija",
    integration_auto: "Automātiski (noteikta)",
    integration_generic: "Tikai multivides atskaņotājs",
    title: "Virsraksts (neobligāts, pēc noklusējuma ierīces nosaukums)",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    show_power: "Rādīt ieslēgšanas taustiņu",
    show_volume: "Rādīt skaļuma taustiņus",
    show_channels: "Rādīt kanālu taustiņus",
    show_transport: "Rādīt atskaņošanas taustiņus",
    show_sources: "Rādīt avotus",
    show_apps: "Rādīt lietotnes",
    haptic: "Taustes atgriezeniskā saite",
    repeat: "Atkārtot, ilgi turot",
    swipe: "Vilkšanas žesti uz virziena taustiņiem",
    swipe_helper: "Velciet pa virziena taustiņiem, lai pārvietotos, pieskarieties, lai nospiestu taustiņu zem pirksta",
    language: "Valoda",
    lang_auto: "Automātiski",
    zoom: "Detaļu poga",
    zoom_helper: "Poga augšējā labajā stūrī, kas izvērš mini karti pilnā pultī un atpakaļ",
    zoom_in: "Rādīt pilno pulti",
    zoom_out: "Rādīt kompakto karti",
  },
  el: {
    state_on: "Ενεργό",
    state_off: "Ανενεργό",
    state_playing: "Αναπαραγωγή",
    state_paused: "Σε παύση",
    state_idle: "Αδρανές",
    state_standby: "Αναμονή",
    state_buffering: "Προσωρινή αποθήκευση",
    state_unavailable: "Μη διαθέσιμο",
    state_unknown: "Άγνωστο",
    k_power: "Ενεργοποίηση / απενεργοποίηση",
    k_up: "Πάνω",
    k_down: "Κάτω",
    k_left: "Αριστερά",
    k_right: "Δεξιά",
    k_ok: "OK",
    k_back: "Πίσω",
    k_home: "Αρχική",
    k_menu: "Μενού",
    k_volume_up: "Αύξηση έντασης",
    k_volume_down: "Μείωση έντασης",
    k_mute: "Σίγαση",
    k_channel_up: "Επόμενο κανάλι",
    k_channel_down: "Προηγούμενο κανάλι",
    k_play_pause: "Αναπαραγωγή / παύση",
    k_previous: "Προηγούμενο",
    k_next: "Επόμενο",
    volume: "Ένταση",
    channel: "Κανάλι",
    sources: "Πηγές",
    close: "Κλείσιμο",
    apps: "Εφαρμογές",
    sources_apps: "Πηγές και εφαρμογές",
    no_entity: "Δεν βρέθηκε τηλεχειριστήριο ή αναπαραγωγέας πολυμέσων. Ορίστε το τηλεχειριστήριο (entity) ή τον αναπαραγωγέα πολυμέσων της κάρτας.",
    unknown_entity: "Η οντότητα δεν βρέθηκε",
    entity: "Τηλεχειριστήριο",
    entity_helper: "Οντότητα remote της τηλεόρασης ή του αποκωδικοποιητή, που στέλνει τα πλήκτρα",
    media_player: "Αναπαραγωγέας πολυμέσων",
    media_player_helper: "Δείχνει τι παίζει, τις πηγές και την ένταση· αν μείνει κενό, αναζητείται στη συσκευή του τηλεχειριστηρίου",
    integration: "Ενσωμάτωση",
    integration_auto: "Αυτόματα (εντοπίστηκε)",
    integration_generic: "Μόνο αναπαραγωγέας πολυμέσων",
    title: "Τίτλος (προαιρετικός, προεπιλογή το όνομα της συσκευής)",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    show_power: "Εμφάνιση πλήκτρου ενεργοποίησης",
    show_volume: "Εμφάνιση πλήκτρων έντασης",
    show_channels: "Εμφάνιση πλήκτρων καναλιών",
    show_transport: "Εμφάνιση πλήκτρων αναπαραγωγής",
    show_sources: "Εμφάνιση πηγών",
    show_apps: "Εμφάνιση εφαρμογών",
    haptic: "Απτική ανάδραση",
    repeat: "Επανάληψη με παρατεταμένο πάτημα",
    swipe: "Χειρονομίες σάρωσης στο κατευθυντικό πλήκτρο",
    swipe_helper: "Σύρετε στο κατευθυντικό πλήκτρο για μετακίνηση, πατήστε για το πλήκτρο κάτω από το δάχτυλο",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Κουμπί πάνω δεξιά που αναπτύσσει τη μίνι κάρτα στο πλήρες τηλεχειριστήριο και πίσω",
    zoom_in: "Εμφάνιση πλήρους τηλεχειριστηρίου",
    zoom_out: "Εμφάνιση συμπαγούς κάρτας",
  },
};

const ICONS = {
  power:
    "M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13",
  up: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
  down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  left: "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",
  right: "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",
  back: "M20 13.5C20 17.09 17.09 20 13.5 20H6V18H13.5C16 18 18 16 18 13.5S16 9 13.5 9H7.83L10.91 12.09L9.5 13.5L4 8L9.5 2.5L10.92 3.91L7.83 7H13.5C17.09 7 20 9.91 20 13.5Z",
  home: "M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22",
  menu: "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  volume:
    "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  mute: "M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  play_pause: "M3,5V19L11,12M13,19H16V5H13M18,5V19H21V5",
  previous: "M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z",
  next: "M16,18H18V6H16M6,18L14.5,12L6,6V18Z",
  sources:
    "M18,7V4A2,2 0 0,0 16,2H8A2,2 0 0,0 6,4V7H5V13L8,19V22H16V19L19,13V7H18M8,4H16V7H14V5H13V7H11V5H10V7H8V4Z",
  apps: "M16,20H20V16H16M16,14H20V10H16M10,8H14V4H10M16,8H20V4H16M10,14H14V10H10M4,14H8V10H4M4,20H8V16H4M10,20H14V16H10M4,8H8V4H4V8Z",
  tv: "M21,17H3V5H21M21,3H3A2,2 0 0,0 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5A2,2 0 0,0 21,3Z",
  tv_play: "M21,3H3C1.89,3 1,3.89 1,5V17A2,2 0 0,0 3,19H8V21H16V19H21A2,2 0 0,0 23,17V5C23,3.89 22.1,3 21,3M21,17H3V5H21M16,11L9,15V7",
  close:
    "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  expand: "M10 21v-2H6.41l4.5-4.5-1.41-1.41-4.5 4.5V14H3v7zm4.5-10.09 4.5-4.5V10h2V3h-7v2h3.59l-4.5 4.5z",
  collapse: "M19.5 3.09 15 7.59V4h-2v7h7V9h-3.59l4.5-4.5zM4 13v2h3.59l-4.5 4.5 1.41 1.41L9 16.41V20h2v-7z",
};

// ---------------------------------------------------------------------------
// Integrations: how each key is sent
// ---------------------------------------------------------------------------

// A key is sent as one of:
//   "Command" or ["A", "B"]          remote.send_command on the remote entity
//   { mp: "service" }                media_player.<service> on the media player (shown only when the player supports it)
//   { call: "domain.service", data } a service of the integration on the media player (webostv.button, kodi.call_method…);
//                                    with `target: false` it is sent without entity (freebox_player.remote)
//   POWER / MUTE                     turned on or off (muted or not) from the current state
//   null                             the integration has no such key: the key is hidden
const POWER = { power: true };
const MUTE = { mute: true };
const MP = (mp) => ({ mp });
const call = (service, data, extra = {}) => ({ call: service, data, ...extra });

const NAV = ["up", "down", "left", "right", "ok", "back", "home", "menu"];
const VOL = ["volume_up", "volume_down", "mute"];
const CH = ["channel_up", "channel_down"];
const TRANSPORT = ["play_pause", "previous", "next"];
const ALL_BUT_POWER = [...NAV, ...VOL, ...CH, ...TRANSPORT];
const KEYS = ["power", ...ALL_BUT_POWER];
// Keys sent again and again while held (long press).
const REPEATABLE = new Set(["up", "down", "left", "right", "volume_up", "volume_down", "channel_up", "channel_down"]);
const DPAD = new Set(["up", "down", "left", "right", "ok"]);

// Media player keys every integration falls back to.
const MEDIA = {
  power: POWER,
  volume_up: MP("volume_up"),
  volume_down: MP("volume_down"),
  mute: MUTE,
  play_pause: MP("media_play_pause"),
  previous: MP("media_previous_track"),
  next: MP("media_next_track"),
};

const fromList = (keys, values) => Object.fromEntries(keys.map((k, i) => [k, values[i] ?? null]));
// The values are given in the order of ALL_BUT_POWER: navigation, volume, channels, transport.
const remoteKeys = (values) => ({ power: POWER, ...fromList(ALL_BUT_POWER, values) });
const serviceKeys = (service, field, values, extra) => ({
  ...MEDIA,
  ...Object.fromEntries(ALL_BUT_POWER.map((k, i) => [k, typeof values[i] === "string" ? call(service, { [field]: values[i] }, extra) : (values[i] ?? null)])),
});

const INTEGRATIONS = {
  apple_tv: {
    name: "Apple TV",
    keys: remoteKeys([
      ...["up", "down", "left", "right", "select", "menu", "home", "top_menu"],
      ...["volume_up", "volume_down", null],
      // The Siri Remote has no channel keys (pyatv's channel_up / channel_down can be set with `commands`).
      ...[null, null],
      ...["play_pause", "previous", "next"],
    ]),
  },
  androidtv_remote: {
    name: "Android TV",
    keys: remoteKeys([
      ...["DPAD_UP", "DPAD_DOWN", "DPAD_LEFT", "DPAD_RIGHT", "DPAD_CENTER", "BACK", "HOME", "MENU"],
      ...["VOLUME_UP", "VOLUME_DOWN", "VOLUME_MUTE"],
      ...["CHANNEL_UP", "CHANNEL_DOWN"],
      ...["MEDIA_PLAY_PAUSE", "MEDIA_PREVIOUS", "MEDIA_NEXT"],
    ]),
  },
  philips_js: {
    name: "Philips TV",
    keys: remoteKeys([
      ...["CursorUp", "CursorDown", "CursorLeft", "CursorRight", "Confirm", "Back", "Home", "Options"],
      ...["VolumeUp", "VolumeDown", "Mute"],
      ...["ChannelStepUp", "ChannelStepDown"],
      ...["PlayPause", "Previous", "Next"],
    ]),
  },
  samsungtv: {
    name: "Samsung TV",
    keys: remoteKeys([
      ...["KEY_UP", "KEY_DOWN", "KEY_LEFT", "KEY_RIGHT", "KEY_ENTER", "KEY_RETURN", "KEY_HOME", "KEY_MENU"],
      ...["KEY_VOLUP", "KEY_VOLDOWN", "KEY_MUTE"],
      ...["KEY_CHUP", "KEY_CHDOWN"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  webostv: {
    name: "LG webOS TV",
    keys: serviceKeys("webostv.button", "button", [
      ...["UP", "DOWN", "LEFT", "RIGHT", "ENTER", "BACK", "HOME", "MENU"],
      ...["VOLUMEUP", "VOLUMEDOWN", "MUTE"],
      ...["CHANNELUP", "CHANNELDOWN"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  roku: {
    name: "Roku",
    keys: remoteKeys([
      ...["up", "down", "left", "right", "select", "back", "home", "info"],
      ...["volume_up", "volume_down", "volume_mute"],
      ...["channel_up", "channel_down"],
      ...["play", MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  androidtv: {
    name: "Fire TV / Android (ADB)",
    keys: serviceKeys("androidtv.adb_command", "command", [
      ...["UP", "DOWN", "LEFT", "RIGHT", "CENTER", "BACK", "HOME", "MENU"],
      ...["VOLUME_UP", "VOLUME_DOWN", "MUTE"],
      ...["input keyevent 166", "input keyevent 167"],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  // Freebox Player (Révolution, Delta, mini 4K…) through the freebox_player custom integration, which has no entity:
  // its service freebox_player.remote sends the network remote's codes. The Pop is an Android TV (androidtv_remote).
  freebox_player: {
    name: "Freebox Player",
    standalone: true,
    keys: {
      ...serviceKeys(
        "freebox_player.remote",
        "code",
        [
          ...["up", "down", "left", "right", "ok", "back", "home", "options"],
          ...["vol_inc", "vol_dec", "mute"],
          ...["prgm_inc", "prgm_dec"],
          ...["play", "prev", "next"],
        ],
        { target: false },
      ),
      power: call("freebox_player.remote", { code: "power" }, { target: false }),
    },
  },
  kodi: {
    name: "Kodi",
    keys: serviceKeys("kodi.call_method", "method", [
      ...["Input.Up", "Input.Down", "Input.Left", "Input.Right", "Input.Select", "Input.Back", "Input.Home", "Input.ContextMenu"],
      ...[MP("volume_up"), MP("volume_down"), MUTE],
      ...[null, null],
      ...[MP("media_play_pause"), MP("media_previous_track"), MP("media_next_track")],
    ]),
  },
  generic: {
    name: "",
    keys: { ...fromList(KEYS, []), ...MEDIA },
  },
};

// media_player supported_features bits.
const F = { PAUSE: 1, VOLUME_SET: 4, VOLUME_MUTE: 8, PREVIOUS: 16, NEXT: 32, TURN_ON: 128, TURN_OFF: 256, VOLUME_STEP: 1024, SELECT_SOURCE: 2048, PLAY: 16384 };
const MP_FEATURE = {
  volume_up: F.VOLUME_STEP | F.VOLUME_SET,
  volume_down: F.VOLUME_STEP | F.VOLUME_SET,
  media_play_pause: F.PAUSE | F.PLAY,
  media_previous_track: F.PREVIOUS,
  media_next_track: F.NEXT,
};

const REPEAT_DELAY_MS = 450;
const REPEAT_EVERY_MS = 180;
const SWIPE_PX = 28;
const OFF_STATES = new Set(["off", "standby", "unavailable", "unknown"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

const domainOf = (id) => String(id || "").split(".")[0];
const supports = (s, bits) => !!s && (Number(s.attributes?.supported_features) & bits) !== 0;

// The remote and the media player of the card: the ones configured, the other one found on the same device, the
// integration from their platform (the remote's first) unless `integration` is set.
const resolve = (hass, config) => {
  const ents = hass?.entities || {};
  let remote = config.entity && domainOf(config.entity) === "remote" ? config.entity : undefined;
  let mp = config.media_player || (config.entity && domainOf(config.entity) === "media_player" ? config.entity : undefined);
  const sibling = (id, domain) => {
    const dev = ents[id]?.device_id;
    if (!dev) return undefined;
    return Object.keys(ents).find((e) => domainOf(e) === domain && ents[e].device_id === dev && !ents[e].hidden && hass.states[e]);
  };
  if (remote && !mp) mp = sibling(remote, "media_player");
  if (mp && !remote) remote = sibling(mp, "remote");
  const platform = ents[remote]?.platform || ents[mp]?.platform;
  const integration = INTEGRATIONS[config.integration] ? config.integration : INTEGRATIONS[platform] ? platform : "generic";
  const device = hass?.devices?.[ents[remote]?.device_id || ents[mp]?.device_id];
  // An integration without entity (Freebox Player): the card works from `integration` alone.
  const standalone = !!INTEGRATIONS[integration].standalone && config.integration === integration;
  return { remote, mp, integration, device, standalone };
};

// The first remote of a known integration (a HomePod, which has an apple_tv remote too, left out), else the first TV
// or player: the card's default entity.
const firstEntity = (hass) => {
  const ents = hass?.entities || {};
  const ids = Object.keys(hass?.states || {});
  const speaker = (id) => /homepod/i.test(`${hass?.devices?.[ents[id]?.device_id]?.model || ""} ${hass?.devices?.[ents[id]?.device_id]?.name || ""}`);
  return (
    ids.find((id) => domainOf(id) === "remote" && INTEGRATIONS[ents[id]?.platform] && ents[id]?.platform !== "generic" && !speaker(id)) ||
    ids.find((id) => domainOf(id) === "media_player" && hass.states[id].attributes?.device_class === "tv") ||
    ids.find((id) => domainOf(id) === "remote")
  );
};

// One key, as the card sends it: the `commands` override, else the integration's. undefined: not available.
const keySpec = (config, integration, key) => {
  const over = config.commands;
  if (over && typeof over === "object" && key in over) return over[key] === null || over[key] === false ? null : over[key];
  return INTEGRATIONS[integration]?.keys[key] ?? null;
};

// Whether a key can be sent with the entities there are (and what the media player supports).
const available = (spec, remote, mpState) => {
  if (!spec) return false;
  if (typeof spec === "string") return !!remote;
  if (Array.isArray(spec)) return !!remote && spec.length > 0;
  if (spec.power) return !!remote || !!mpState;
  if (spec.mute) return supports(mpState, F.VOLUME_MUTE);
  if (spec.mp) return !!mpState && (!(spec.mp in MP_FEATURE) || supports(mpState, MP_FEATURE[spec.mp]));
  if (spec.call) return spec.target === false || !!mpState;
  if (spec.action || spec.service) return true;
  return false;
};

// The service call of a key: [domain, service, data], or null.
const serviceCall = (spec, remote, mp, states) => {
  const mpState = states[mp];
  if (typeof spec === "string" || Array.isArray(spec)) return remote ? ["remote", "send_command", { entity_id: remote, command: spec }] : null;
  if (!spec || typeof spec !== "object") return null;
  if (spec.power) {
    const on = mpState ? !OFF_STATES.has(mpState.state) : states[remote]?.state === "on";
    const feature = on ? F.TURN_OFF : F.TURN_ON;
    const service = on ? "turn_off" : "turn_on";
    if (mpState && (supports(mpState, feature) || !remote)) return ["media_player", service, { entity_id: mp }];
    return remote ? ["remote", service, { entity_id: remote }] : null;
  }
  if (spec.mute) return mp ? ["media_player", "volume_mute", { entity_id: mp, is_volume_muted: !mpState?.attributes?.is_volume_muted }] : null;
  if (spec.mp) return mp ? ["media_player", spec.mp, { entity_id: mp }] : null;
  if (spec.call) {
    const [d, s] = String(spec.call).split(".");
    if (spec.target === false) return [d, s, { ...(spec.data || {}) }];
    return mp ? [d, s, { entity_id: mp, ...(spec.data || {}) }] : null;
  }
  // A Home Assistant action of the `commands` option: { action: "script.turn_on", data: {…}, target: {…} }.
  const action = spec.action || spec.service;
  if (action) {
    const [d, s] = String(action).split(".");
    if (!d || !s) return null;
    const data = { ...(spec.data || {}), ...(spec.target || {}) };
    if (!spec.target && !("entity_id" in data) && !["script", "scene", "automation", "notify"].includes(d)) {
      const id = d === "remote" ? remote : mp || remote;
      if (id) data.entity_id = id;
    }
    return [d, s, data];
  }
  return null;
};

const stateKey = (s) => {
  if (!s) return "unknown";
  const k = String(s.state);
  return ["on", "off", "playing", "paused", "idle", "standby", "buffering", "unavailable"].includes(k) ? k : "unknown";
};

// Progress of the media playing: { pct, left (s), playing }, or null.
const progress = (s, now = Date.now()) => {
  const a = s?.attributes || {};
  const dur = Number(a.media_duration);
  const pos = Number(a.media_position);
  if (!(dur > 0) || !Number.isFinite(pos)) return null;
  const playing = s.state === "playing";
  const since = playing && a.media_position_updated_at ? Math.max(0, (now - Date.parse(a.media_position_updated_at)) / 1000) : 0;
  const at = Math.min(dur, pos + (Number.isFinite(since) ? since : 0));
  return { pct: (at / dur) * 100, left: dur - at, playing };
};

// ---------------------------------------------------------------------------
// DOM patching: the new HTML is applied onto the elements there are, so that nothing is replaced that did not
// change (a running animation, the key under the finger, the focus).
// ---------------------------------------------------------------------------

const sameNode = (a, b) =>
  a.nodeType === b.nodeType && a.nodeName === b.nodeName && (a.nodeType !== 1 || a.getAttribute("data-k") === b.getAttribute("data-k"));

const patchChildren = (into, from) => {
  const old = [...into.childNodes];
  const next = [...from.childNodes];
  next.forEach((n, i) => {
    const o = old[i];
    if (!o) into.appendChild(n);
    else if (!sameNode(o, n)) into.replaceChild(n, o);
    else if (o.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
    } else {
      for (const { name } of [...o.attributes]) if (!n.hasAttribute(name)) o.removeAttribute(name);
      for (const { name, value } of [...n.attributes]) if (o.getAttribute(name) !== value) o.setAttribute(name, value);
      patchChildren(o, n);
    }
  });
  for (let i = old.length - 1; i >= next.length; i--) old[i].remove();
};

const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  if (!tpl.content || !root.childNodes) {
    root.innerHTML = html;
    return;
  }
  patchChildren(root, tpl.content);
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --rc-accent: #7c4dff;
          --rc-idle: var(--disabled-text-color, #9e9e9e);
          --rc-glass: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
          --rc-glass-hover: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
          --rc-line: color-mix(in srgb, var(--primary-text-color) 14%, transparent);
          --rc-accent-text: color-mix(in srgb, var(--rc-accent) 60%, var(--primary-text-color)); }
  :host { display: block; min-width: 0; --rc-natural-width: 360px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--rc-natural-width)); height: 0; }
  ha-card { overflow: hidden; container-type: inline-size; position: relative; }
  .icon { width: 20px; height: 20px; fill: currentColor; flex: none; }
  [role="button"] { cursor: pointer; }
  [role="button"]:focus-visible, button:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  .titles { flex: 1 1 0; min-width: 5ch; border-radius: 6px; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; line-height: 1.4; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 6px; }
  .sub span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .type-icon { display: flex; flex: none; width: 40px; height: 40px; border-radius: 50%; align-items: center; justify-content: center;
               background: color-mix(in srgb, var(--rc-accent) 16%, transparent); transition: background-color .2s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--rc-accent) 60%, var(--primary-text-color)); transition: fill .2s ease; }
  .type-icon.off { background: color-mix(in srgb, var(--rc-idle) 14%, transparent); }
  .type-icon.off .icon { fill: var(--secondary-text-color); }
  .warning { padding: 16px; color: color-mix(in srgb, var(--warning-color, #ffa600) 50%, var(--primary-text-color)); }
  /* Keys: outlined smoked glass, never filled; the accent marks an active state (on, muted, playing). */
  .key { all: unset; box-sizing: border-box; display: grid; place-items: center; cursor: pointer; color: var(--primary-text-color);
         background: var(--rc-glass); border: 1px solid var(--rc-line); border-radius: 50%; width: 48px; height: 48px; flex: none;
         touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
         transition: background-color .15s ease, transform .1s ease, color .2s ease, border-color .2s ease; }
  .key:hover { background: var(--rc-glass-hover); }
  .key:active, .key.pressed { transform: scale(.93); background: color-mix(in srgb, var(--rc-accent) 14%, transparent); }
  .key.on { color: var(--rc-accent-text); border-color: color-mix(in srgb, var(--rc-accent) 55%, transparent); }
  .key.small, .key.power { width: 40px; height: 40px; }
  .key.small .icon { width: 18px; height: 18px; }
  .key:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -2px -4px 0 0; border-radius: 50%; align-self: flex-start;
          display: grid; place-items: center; color: var(--secondary-text-color);
          background: color-mix(in srgb, var(--rc-idle) 10%, transparent); border: 1px solid color-mix(in srgb, var(--rc-idle) 25%, transparent); }
  .zoom .icon { width: 14px; height: 14px; }
  .zoom:hover { background: color-mix(in srgb, var(--rc-idle) 18%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 1px; }
  /* Three bars dance while playing. */
  .eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; flex: none; }
  .eq i { width: 3px; height: 100%; border-radius: 1px; background: var(--rc-accent); transform-origin: bottom; transform: scaleY(.35); }
  .eq.run i { animation: rc-eq .9s ease-in-out infinite; }
  .eq.run i:nth-child(2) { animation-delay: -.3s; animation-duration: .7s; }
  .eq.run i:nth-child(3) { animation-delay: -.6s; animation-duration: 1.1s; }
  @keyframes rc-eq { 0%, 100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
  /* Progress of the media playing, moving on its own between two updates. */
  .track { height: 3px; border-radius: 2px; background: var(--rc-line); overflow: hidden; }
  .track > div { height: 100%; border-radius: 2px; background: var(--rc-accent); width: var(--from); }
  .track > div.run { animation: rc-progress var(--left) linear forwards; }
  @keyframes rc-progress { from { width: var(--from); } to { width: 100%; } }
  @container (max-width: 230px) {
    .header { gap: 6px; }
  }
`;

const FULL_STYLE = `
  .progress { margin: 10px 12px 0; }
  .content { padding: 16px 12px 14px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  /* The D-pad: a ring with four chevrons and OK in the middle, sized to the card. */
  .dpad { position: relative; width: min(100%, 224px); aspect-ratio: 1; border-radius: 50%; flex: none;
          background: var(--rc-glass); border: 1px solid var(--rc-line); box-sizing: border-box; }
  .dpad.swipe, .dpad.swipe .arrow, .dpad.swipe .ok { touch-action: none; }
  .dpad .arrow { all: unset; position: absolute; display: grid; place-items: center; cursor: pointer; color: var(--primary-text-color);
                 touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
                 border-radius: 50%; transition: background-color .15s ease; }
  .dpad .arrow .icon { width: 30px; height: 30px; transition: transform .1s ease, color .15s ease; }
  .dpad .arrow:hover { background: var(--rc-glass); }
  .dpad .arrow:active .icon, .dpad .arrow.pressed .icon { transform: scale(.85); color: var(--rc-accent-text); }
  .dpad .arrow:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: -4px; }
  .dpad .up { top: 2%; left: 30%; width: 40%; height: 28%; }
  .dpad .down { bottom: 2%; left: 30%; width: 40%; height: 28%; }
  .dpad .left { left: 2%; top: 30%; width: 28%; height: 40%; }
  .dpad .right { right: 2%; top: 30%; width: 28%; height: 40%; }
  .dpad .ok { all: unset; position: absolute; left: 31%; top: 31%; width: 38%; height: 38%; border-radius: 50%; box-sizing: border-box;
              display: grid; place-items: center; cursor: pointer; font-size: 15px; font-weight: 600; letter-spacing: .04em;
              color: var(--primary-text-color); background: var(--rc-glass); border: 1px solid var(--rc-line);
              touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent;
              transition: background-color .15s ease, transform .1s ease, color .15s ease, border-color .15s ease; }
  .dpad .ok:hover { background: var(--rc-glass-hover); }
  .dpad .ok:active, .dpad .ok.pressed { transform: scale(.94); color: var(--rc-accent-text); border-color: color-mix(in srgb, var(--rc-accent) 55%, transparent); }
  .dpad .ok:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  .keys { display: flex; justify-content: center; gap: 14px; }
  /* Rockers: volume and channel, one outlined pill each. */
  .rockers { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
  .rocker { display: flex; align-items: center; gap: 2px; padding: 3px; border-radius: 26px; border: 1px solid var(--rc-line); }
  .rocker .key { background: transparent; border-color: transparent; }
  .rocker .key:hover { background: var(--rc-glass-hover); }
  .rocker .key.on { border-color: color-mix(in srgb, var(--rc-accent) 55%, transparent); }
  .rocker .label { font-size: 11px; font-weight: 500; color: var(--secondary-text-color); letter-spacing: .05em; padding: 0 2px; min-width: 2ch; text-align: center; }
  .transport { display: flex; justify-content: center; align-items: center; gap: 10px; }
  .transport .sep { width: 1px; height: 24px; background: var(--rc-line); margin: 0 2px; }
  /* Popup at the top of the card: apps and sources. */
  .scrim { position: absolute; inset: 0; z-index: 2; background: color-mix(in srgb, var(--card-background-color, #fff) 45%, transparent); }
  .popup { position: absolute; top: 8px; left: 8px; right: 8px; z-index: 3; max-height: calc(100% - 16px); display: flex; flex-direction: column;
           background: var(--card-background-color, #fff); border: 1px solid var(--rc-line); border-radius: 14px;
           box-shadow: 0 8px 28px rgba(0,0,0,.22); overflow: hidden; }
  .popup-head { display: flex; align-items: center; gap: 8px; padding: 10px 10px 6px 14px; font-weight: 500; font-size: 14px; }
  .popup-head > .icon { color: var(--rc-accent-text); }
  .popup-head span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .popup-body { overflow-y: auto; padding: 0 8px 10px; display: flex; flex-direction: column; gap: 6px; }
  .group-title { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--secondary-text-color); padding: 6px 6px 2px; }
  .apps { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 6px; }
  .app { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 12px; cursor: pointer; min-width: 0;
         background: var(--rc-glass); border: 1px solid var(--rc-line); font-size: 13px; transition: background-color .15s ease; }
  .app:hover { background: var(--rc-glass-hover); }
  .app.on { border-color: color-mix(in srgb, var(--rc-accent) 55%, transparent); color: var(--rc-accent-text); }
  .app:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: 2px; }
  .app span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .app ha-icon { --mdc-icon-size: 18px; width: 18px; height: 18px; flex: none; color: var(--rc-accent-text); }
  .app .initial { flex: none; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 600;
                  background: color-mix(in srgb, var(--rc-accent) 16%, transparent); color: var(--rc-accent-text); }
  .sources { display: flex; flex-direction: column; gap: 2px; }
  .source { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 10px; cursor: pointer; font-size: 14px; }
  .source:hover { background: var(--rc-glass); }
  .source.on { color: var(--rc-accent-text); font-weight: 500; }
  .source .icon { width: 18px; height: 18px; margin-left: auto; }
  .source span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .source:focus-visible { outline: 2px solid var(--primary-color, var(--rc-accent)); outline-offset: -2px; }
  @container (max-width: 280px) {
    .key { width: 42px; height: 42px; }
    .key.small, .key.power { width: 36px; height: 36px; }
    .keys { gap: 10px; }
    .transport { gap: 6px; }
  }
`;

const MINI_STYLE = `
  :host { --rc-natural-width: 300px; }
  .content { padding: 10px 12px 12px; display: flex; align-items: center; gap: 10px; }
  .now { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; border-radius: 8px; }
  .art { flex: none; width: 40px; height: 40px; border-radius: 9px; overflow: hidden; display: grid; place-items: center;
         background: var(--rc-glass); border: 1px solid var(--rc-line); color: var(--secondary-text-color); box-sizing: border-box; }
  .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .art .icon { width: 20px; height: 20px; }
  .now-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .now-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 6px; }
  .now-title span, .now-sub { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .now-sub { font-size: 12px; color: var(--secondary-text-color); }
  .now .track { margin-top: 3px; }
  .mini-keys { display: flex; gap: 4px; flex: none; margin-left: auto; }
  .mini-keys .narrow-only { display: none; }
  @container (max-width: 250px) {
    .mini-keys .wide-only, .header .key.power { display: none; }
    .mini-keys .narrow-only { display: grid; }
    .art { display: none; }
  }
`;

// ---------------------------------------------------------------------------
// "A click elsewhere" (closes the popup, brings the mini card back): caught on the pointer, as
// iOS sends no click for a tap on something not clickable. It counts when the press and the release are both outside
// the card; keyboard clicks go through the click event.
// ---------------------------------------------------------------------------

const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

const watchOutside = (card, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOutside(card, ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOutside(card, ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOutside(card, ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};

const sameDeps = (a, b) => !!a && a.length === b.length && a.every((d, i) => d === b[i]);

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

class RemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    const root = this.shadowRoot;
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("pointerdown", (ev) => this._onDown(ev));
    root.addEventListener("pointermove", (ev) => this._onMove(ev));
    root.addEventListener("contextmenu", (ev) => {
      if (ev.composedPath().some((n) => n.dataset?.key)) ev.preventDefault();
    });
    root.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && this._popup) {
        ev.stopPropagation();
        return this._setPopup(null);
      }
      if ((ev.key !== "Enter" && ev.key !== " ") || ev.target?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      ev.target.click();
    });
    this._onUp = () => this._release();
  }

  static getConfigElement() {
    return document.createElement("remote-card-editor");
  }

  static getStubConfig(hass) {
    const id = firstEntity(hass);
    return id ? { entity: id } : {};
  }

  getCardSize() {
    return 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    if (deps && sameDeps(this._lastDeps, deps)) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // What a render reads from hass: the registries, the language and the states of the remote and the player.
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const r = resolve(h, this._config);
    return [h.entities, h.devices, h.language, h.locale, h.states[r.remote], h.states[r.mp]];
  }

  connectedCallback() {
    this._outside ??= watchOutside(this, () => this._outsideClick());
    this._outside.on();
    if (this._hass && this._config) this._update();
  }

  disconnectedCallback() {
    this._outside?.off();
    this._release();
    // Left (another view, a conditional card hidden): the popup closes, sending nothing.
    this._popup = null;
  }

  _outsideClick() {
    if (!this._popup) return;
    this._popup = null;
    this._update();
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.apps !== undefined && !Array.isArray(config.apps)) throw new Error("apps must be a list");
    if (config.commands !== undefined && (typeof config.commands !== "object" || Array.isArray(config.commands) || config.commands === null)) {
      throw new Error("commands must be a map of keys to commands");
    }
    this._config = { ...config };
    this._lastDeps = null;
    this._html = "";
    this._update();
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  // The card is not rewritten while a key is held: the element under the finger stays the one pressed (and keeps its
  // pressed look); the update waiting is drawn at the release.
  _update() {
    if (!this._hass || !this._config) return;
    if (this._press) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    const html = this._render();
    if (html === this._html) return;
    this._html = html;
    morph(this.shadowRoot, html);
  }

  _show(name) {
    return this._config[name] !== false;
  }

  // ---- Sending -----------------------------------------------------------

  _ctx() {
    return resolve(this._hass, this._config);
  }

  _spec(key, ctx = this._ctx()) {
    const spec = keySpec(this._config, ctx.integration, key);
    return available(spec, ctx.remote, this._hass.states[ctx.mp]) ? spec : null;
  }

  _send(key) {
    const ctx = this._ctx();
    const spec = this._spec(key, ctx);
    if (!spec) return false;
    return this._call(serviceCall(spec, ctx.remote, ctx.mp, this._hass.states));
  }

  _call(c) {
    if (!c) return false;
    if (this._config.haptic !== false) this.dispatchEvent(new CustomEvent("haptic", { detail: "light", bubbles: true, composed: true }));
    this._hass.callService(c[0], c[1], c[2]);
    return true;
  }

  // Press on a key: sent at once (and again while held, for the repeatable keys). With swipe gestures, a press on
  // the D-pad waits: a swipe sends its direction, a tap the key under the finger, a hold repeats it.
  _onDown(ev) {
    if (ev.button > 0) return;
    const el = ev.composedPath().find((n) => n.dataset?.key);
    if (!el) return;
    this._release();
    const key = el.dataset.key;
    const swipe = this._config.swipe === true && DPAD.has(key);
    const p = { key, el, x: ev.clientX, y: ev.clientY, swipe, sent: false };
    this._press = p;
    this._fromPointer = true;
    el.classList?.add("pressed");
    window.addEventListener?.("pointerup", this._onUp, true);
    window.addEventListener?.("pointercancel", this._onUp, true);
    const hold = () => {
      p.sent = this._send(key) || p.sent;
      if (this._config.repeat !== false && REPEATABLE.has(key)) {
        p.timer = setTimeout(() => {
          p.timer = setInterval(() => this._send(key), REPEAT_EVERY_MS);
        }, REPEAT_DELAY_MS);
      }
    };
    if (!swipe) return hold();
    p.timer = setTimeout(() => {
      p.timer = null;
      if (REPEATABLE.has(key) || key === "ok") hold();
    }, REPEAT_DELAY_MS);
  }

  _onMove(ev) {
    const p = this._press;
    if (!p?.swipe) return;
    const dx = ev.clientX - p.x;
    const dy = ev.clientY - p.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return;
    clearTimeout(p.timer);
    clearInterval(p.timer);
    p.timer = null;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
    p.sent = this._send(dir) || p.sent;
    p.swiped = true;
    p.x = ev.clientX;
    p.y = ev.clientY;
  }

  // End of a press: the repeat stops; a tap on the D-pad with swipe gestures sends its key now.
  _release() {
    const p = this._press;
    window.removeEventListener?.("pointerup", this._onUp, true);
    window.removeEventListener?.("pointercancel", this._onUp, true);
    if (!p) return;
    this._press = null;
    clearTimeout(p.timer);
    clearInterval(p.timer);
    p.el.classList?.remove("pressed");
    if (p.swipe && !p.sent && !p.swiped) this._send(p.key);
    if (this._dirty) this._update();
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.key || n.dataset.action));
    if (!el) return;
    ev.stopPropagation();
    const { key, action } = el.dataset;
    if (key) {
      // Sent at the press already; a keyboard click (Enter, Space) or one that came with no press sends it here.
      if (!this._fromPointer || ev.detail === 0) this._send(key);
      this._fromPointer = false;
      return;
    }
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "popup") return this._setPopup(this._popup ? null : "popup", ev);
    if (action === "close") return this._setPopup(null);
    if (action === "source") return this._selectSource(el.dataset.source);
    if (action === "app") return this._launch(Number(el.dataset.index));
    if (action === "more_info") return this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: el.dataset.entity }, bubbles: true, composed: true }));
  }

  _toggleZoom() {}

  // The focus moves into the popup only for the keyboard (a mouse or a finger would draw its ring).
  _setPopup(name, ev) {
    this._popup = name;
    this._update();
    if (name && ev?.detail === 0) this.shadowRoot.querySelector?.(".popup .source.on, .popup .app.on, .popup .close")?.focus?.({ preventScroll: true });
  }

  _selectSource(source) {
    const { mp } = this._ctx();
    this._popup = null;
    if (mp && source !== undefined) this._call(["media_player", "select_source", { entity_id: mp, source }]);
    this._update();
  }

  // An app shortcut: a source of the player, an activity of the remote (an app link or package on Android TV), a
  // remote command, or any Home Assistant action. The popup closes.
  _launch(index) {
    const app = (this._config.apps || [])[index];
    this._popup = null;
    this._update();
    if (!app || typeof app !== "object") return;
    const { remote, mp } = this._ctx();
    if (app.source !== undefined && mp) return this._call(["media_player", "select_source", { entity_id: mp, source: app.source }]);
    if (app.activity !== undefined && remote) return this._call(["remote", "turn_on", { entity_id: remote, activity: app.activity }]);
    if (app.command !== undefined && remote) return this._call(["remote", "send_command", { entity_id: remote, command: app.command }]);
    if (app.action || app.service) return this._call(serviceCall(app, remote, mp, this._hass.states));
  }

  // ---- Parts -------------------------------------------------------------

  _name(ctx) {
    const d = ctx.device;
    const s = this._hass.states[ctx.mp] || this._hass.states[ctx.remote];
    return this._config.title || d?.name_by_user || d?.name || s?.attributes?.friendly_name || ctx.mp || ctx.remote || INTEGRATIONS[ctx.integration].name;
  }

  // State of the TV or box, and what it plays: { on, state (text), app, title, artist, playing, pic, progress }.
  _media(ctx) {
    const mpState = this._hass.states[ctx.mp];
    const s = mpState || this._hass.states[ctx.remote];
    const k = stateKey(s);
    const on = !!s && !OFF_STATES.has(s.state);
    const a = (on && mpState?.attributes) || {};
    const episode = a.media_season && a.media_episode ? `S${a.media_season} · E${a.media_episode}` : "";
    return {
      known: !!s,
      on,
      state: this._t(`state_${k}`),
      app: a.app_name || a.source || "",
      title: a.media_title || a.media_channel || "",
      artist: [a.media_artist || a.media_series_title || a.media_album_name, episode].filter(Boolean).join(" · "),
      playing: on && mpState?.state === "playing",
      pic: on ? a.entity_picture_local || a.entity_picture : "",
      progress: on ? progress(mpState) : null,
    };
  }

  _eq(m) {
    return m.playing && m.title ? `<span class="eq${m.playing ? " run" : ""}" aria-hidden="true"><i></i><i></i><i></i></span>` : "";
  }

  _track(p) {
    if (!p) return "";
    return `<div class="track" data-k="track"><div class="${p.playing ? "run" : ""}" style="--from:${p.pct.toFixed(2)}%;--left:${Math.max(0, Math.round(p.left))}s"></div></div>`;
  }

  // The full card's subtitle: what is playing (app · title), else the state.
  _subtitle(m, ctx) {
    if (!m.known) return INTEGRATIONS[ctx.integration].name;
    if (!m.on) return m.state;
    const app = m.title && m.app === m.title ? "" : m.app;
    return [app, m.title].filter(Boolean).join(" · ") || m.state;
  }

  _header(ctx, m, sub) {
    const entity = ctx.mp || ctx.remote;
    const more = entity ? ` role="button" tabindex="0" data-action="more_info" data-entity="${esc(entity)}"` : "";
    const power = this._show("show_power") ? this._key(ctx, "power", { cls: "key power", on: m.on, title: m.known ? `${this._t("k_power")} · ${m.state}` : "" }) : "";
    return `<div class="header">
        <span class="type-icon${m.known && !m.on ? " off" : ""}">${svgIcon(ICONS.tv)}</span>
        <div class="titles"${more}>
          ${this._show("show_title") ? `<div class="name">${esc(this._name(ctx))}</div>` : ""}
          ${sub && this._show("show_subtitle") ? `<div class="sub">${sub}</div>` : ""}
        </div>
        ${power}
        ${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  // A key: its icon (or text), its label, the accent when active. Hidden when the integration has no such key.
  _key(ctx, key, { cls = "key", icon = ICONS[key], text, on = false, extra = "", title = "" } = {}) {
    if (!this._spec(key, ctx)) return "";
    const label = esc(this._t(`k_${key}`));
    const pressed = key === "mute" || key === "power" ? ` aria-pressed="${on}"` : "";
    return `<button class="${cls}${on ? " on" : ""}${extra}" data-key="${key}" data-k="${key}" title="${title ? esc(title) : label}" aria-label="${label}"${pressed}>${text ? esc(text) : svgIcon(icon)}</button>`;
  }

  _playPause(ctx, m, cls = "key") {
    const s = this._hass.states[ctx.mp];
    return this._key(ctx, "play_pause", { cls, icon: s ? (m.playing ? ICONS.pause : ICONS.play) : ICONS.play_pause, on: m.playing });
  }

  _volume(ctx, cls = "key", extra = "") {
    const muted = !!this._hass.states[ctx.mp]?.attributes?.is_volume_muted;
    return [
      this._key(ctx, "volume_down", { cls, icon: ICONS.minus }),
      this._key(ctx, "mute", { cls, icon: muted ? ICONS.mute : ICONS.volume, on: muted, extra }),
      this._key(ctx, "volume_up", { cls, icon: ICONS.plus }),
    ].join("");
  }

  // What the popup holds: the app shortcuts of the card and the sources of the player.
  _choices(ctx) {
    const s = this._hass.states[ctx.mp];
    const apps = this._show("show_apps") ? (this._config.apps || []).map((a, i) => [a, i]).filter(([a]) => a && typeof a === "object") : [];
    const sources = this._show("show_sources") && s && supports(s, F.SELECT_SOURCE) ? s.attributes?.source_list || [] : [];
    const label = this._t(apps.length && sources.length ? "sources_apps" : apps.length ? "apps" : "sources");
    return { apps, sources, label, cur: s?.attributes };
  }

  _popupButton(ctx) {
    const { apps, sources, label } = this._choices(ctx);
    if (!apps.length && !sources.length) return "";
    const l = esc(label);
    return `<button class="key small${this._popup ? " on" : ""}" data-action="popup" data-k="popup-button" title="${l}" aria-label="${l}" aria-haspopup="dialog" aria-expanded="${!!this._popup}">${svgIcon(apps.length ? ICONS.apps : ICONS.sources)}</button>`;
  }

  _popupHtml(ctx) {
    if (!this._popup) return "";
    const { apps, sources, label, cur } = this._choices(ctx);
    const close = esc(this._t("close"));
    const appItems = apps
      .map(([a, i]) => {
        const name = String(a.name ?? a.source ?? a.activity ?? "");
        const on = a.source !== undefined && cur && (cur.source === a.source || cur.app_name === a.source);
        const icon = a.icon ? `<ha-icon icon="${esc(a.icon)}"></ha-icon>` : `<span class="initial">${esc(name.slice(0, 1).toUpperCase())}</span>`;
        return `<button class="app${on ? " on" : ""}" data-action="app" data-index="${i}" title="${esc(name)}">${icon}<span>${esc(name)}</span></button>`;
      })
      .join("");
    const sourceItems = sources
      .map((src) => {
        const on = src === (cur?.source ?? cur?.app_name);
        return `<button class="source${on ? " on" : ""}" data-action="source" data-source="${esc(src)}" aria-pressed="${on}"><span>${esc(src)}</span>${on ? svgIcon(ICONS.check) : ""}</button>`;
      })
      .join("");
    const both = apps.length && sources.length;
    return `<div class="scrim" data-action="close" data-k="scrim"></div>
      <div class="popup" role="dialog" aria-label="${esc(label)}" data-k="popup">
        <div class="popup-head">${svgIcon(apps.length ? ICONS.apps : ICONS.sources)}<span>${esc(label)}</span>
          <button class="key small close" data-action="close" title="${close}" aria-label="${close}">${svgIcon(ICONS.close)}</button></div>
        <div class="popup-body">
          ${apps.length ? `${both ? `<div class="group-title">${esc(this._t("apps"))}</div>` : ""}<div class="apps">${appItems}</div>` : ""}
          ${sources.length ? `${both ? `<div class="group-title">${esc(this._t("sources"))}</div>` : ""}<div class="sources">${sourceItems}</div>` : ""}
        </div>
      </div>`;
  }

  _rockers(ctx) {
    const parts = [];
    if (this._show("show_volume")) {
      const vol = this._volume(ctx);
      if (vol) parts.push(`<div class="rocker" role="group" aria-label="${esc(this._t("volume"))}" data-k="vol">${vol}</div>`);
    }
    if (this._show("show_channels")) {
      const down = this._key(ctx, "channel_down", { icon: ICONS.down });
      const up = this._key(ctx, "channel_up", { icon: ICONS.up });
      if (down || up) parts.push(`<div class="rocker" role="group" aria-label="${esc(this._t("channel"))}" data-k="ch">${down}<span class="label" aria-hidden="true">CH</span>${up}</div>`);
    }
    return parts.length ? `<div class="rockers" data-k="rockers">${parts.join("")}</div>` : "";
  }

  _dpad(ctx) {
    const arrows = ["up", "left", "right", "down"].map((k) => this._key(ctx, k, { cls: `arrow ${k}` })).join("");
    const ok = this._key(ctx, "ok", { cls: "ok", text: this._t("k_ok") });
    if (!arrows && !ok) return "";
    return `<div class="dpad${this._config.swipe === true ? " swipe" : ""}" data-k="dpad">${arrows}${ok}</div>`;
  }

  _transport(ctx, m) {
    const keys = this._show("show_transport") ? [this._key(ctx, "previous"), this._playPause(ctx, m), this._key(ctx, "next")].join("") : "";
    const popup = this._popupButton(ctx);
    if (!keys && !popup) return "";
    return `<div class="transport" data-k="transport">${keys}${keys && popup ? `<span class="sep" aria-hidden="true"></span>` : ""}${popup}</div>`;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // null, or the error to show.
  _check(ctx) {
    if (ctx.standalone) return null;
    if (!ctx.remote && !ctx.mp) return this._config.entity || this._config.media_player ? "unknown_entity" : "no_entity";
    if (!this._hass.states[ctx.remote] && !this._hass.states[ctx.mp]) return "unknown_entity";
    return null;
  }

  _render() {
    const ctx = this._ctx();
    const error = this._check(ctx);
    if (error) return this._errorCard(error);
    const m = this._media(ctx);
    const nav = ["back", "home", "menu"].map((k) => this._key(ctx, k)).join("");
    const sub = this._subtitle(m, ctx);
    return `<style>${BASE_STYLE}${FULL_STYLE}</style>
      <ha-card>
        ${this._header(ctx, m, sub ? `${m.on ? this._eq(m) : ""}<span>${esc(sub)}</span>` : "")}
        ${m.progress && this._show("show_subtitle") ? `<div class="progress" data-k="progress">${this._track(m.progress)}</div>` : ""}
        <div class="content">
          ${this._dpad(ctx)}
          ${nav ? `<div class="keys" data-k="nav">${nav}</div>` : ""}
          ${this._rockers(ctx)}
          ${this._transport(ctx, m)}
        </div>
        ${this._popupHtml(ctx)}
      </ha-card>`;
  }
}

// The mini card: power, what is playing, play / pause and volume; its detail button (top right, `zoom: false` removes
// it) unfolds it into the full remote, and a click anywhere else on the page brings the compact view back.
class RemoteMiniCard extends RemoteCard {
  constructor() {
    super();
    this._unzoom = watchOutside(this, () => {
      if (this._zoomed) this._setZoom(false);
    });
  }

  static getConfigElement() {
    return document.createElement("remote-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    this._unzoom.on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._unzoom.off();
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : 2;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6, rows: "auto" };
  }

  _zoomButton() {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}" aria-pressed="${!!z}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  _setZoom(on) {
    this._zoomed = on;
    if (!on) this._popup = null;
    this._update();
    this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
  }

  _toggleZoom(ev) {
    this._setZoom(!this._zoomed);
    if (ev?.detail === 0) this.shadowRoot.querySelector?.(".zoom")?.focus({ preventScroll: true });
  }

  _nowPlaying(ctx, m) {
    if (!this._hass.states[ctx.mp]) return `<div class="now" data-k="now"></div>`;
    const title = m.on ? m.title || m.app || m.state : m.state;
    const sub = m.on && m.title ? m.artist : "";
    return `<div class="now" role="button" tabindex="0" data-action="more_info" data-entity="${esc(ctx.mp)}" data-k="now">
        <div class="art">${m.pic ? `<img src="${esc(m.pic)}" alt="">` : svgIcon(ICONS.tv_play)}</div>
        <div class="now-text">
          <div class="now-title">${m.on ? this._eq(m) : ""}<span>${esc(title)}</span></div>
          ${sub ? `<div class="now-sub">${esc(sub)}</div>` : ""}
          ${this._track(m.progress)}
        </div>
      </div>`;
  }

  _render() {
    if (this._zoomed) return super._render();
    const ctx = this._ctx();
    const error = this._check(ctx);
    if (error) return this._errorCard(error);
    const m = this._media(ctx);
    // On a narrow card, the power key leaves the header for the keys, leaving the name its room.
    const keys = [
      this._show("show_power") ? this._key(ctx, "power", { cls: "key small narrow-only", on: m.on }) : "",
      this._show("show_transport") ? this._playPause(ctx, m, "key small") : "",
      this._show("show_volume") ? this._volume(ctx, "key small wide-only") : "",
    ].join("");
    const sub = !m.known ? INTEGRATIONS[ctx.integration].name : m.on ? m.app || m.state : m.state;
    return `<style>${BASE_STYLE}${MINI_STYLE}</style>
      <ha-card>
        ${this._header(ctx, m, sub ? `<span>${esc(sub)}</span>` : "")}
        <div class="content">
          ${this._nowPlaying(ctx, m)}
          <div class="mini-keys" data-k="mini-keys">${keys}</div>
        </div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// [name, default] of the switches of the full card's editor.
const TOGGLES = [
  ["show_title", true],
  ["show_subtitle", true],
  ["show_power", true],
  ["show_volume", true],
  ["show_channels", true],
  ["show_transport", true],
  ["show_sources", true],
  ["show_apps", true],
  ["haptic", true],
  ["repeat", true],
  ["swipe", false],
];

// Keeps the YAML minimal: drops empty values and options left at their default.
const cleanConfig = (value, defaults) => {
  const config = { ...value };
  for (const [k, v] of Object.entries(config)) {
    if (v === "" || v === undefined || v === null || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
  }
  return config;
};

class RemoteCardEditor extends HTMLElement {
  static get toggles() {
    return TOGGLES;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const integrations = Object.entries(INTEGRATIONS)
      .filter(([k]) => k !== "generic")
      .map(([value, i]) => ({ value, label: i.name }));
    return [
      { name: "entity", selector: { entity: { domain: ["remote", "media_player"] } } },
      { name: "media_player", selector: { entity: { domain: "media_player" } } },
      {
        name: "integration",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("integration_auto") }, ...integrations, { value: "generic", label: tr("integration_generic") }] } },
      },
      { name: "title", selector: { text: {} } },
      { type: "grid", name: "", schema: this.constructor.toggles.map(([name]) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = Object.fromEntries(toggles);
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, s.name);
      this._form.computeHelper = (s) => (["entity", "media_player", "swipe", "zoom"].includes(s.name) ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._config = cleanConfig(ev.detail.value, defaults);
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    const data = { ...this._config };
    for (const [name, def] of toggles) if (data[name] === undefined) data[name] = def;
    this._form.hass = this._hass;
    if (!sameDeps(this._dataDeps, [this._config])) {
      this._dataDeps = [this._config];
      this._form.data = data;
    }
    const deps = [lang(this._hass, this._config)];
    if (!sameDeps(this._schemaDeps, deps)) {
      this._schemaDeps = deps;
      this._form.schema = this._schema();
    }
  }
}

// The full card's options, which the unfolded mini card uses, and the detail button.
class RemoteMiniCardEditor extends RemoteCardEditor {
  static get toggles() {
    return [...TOGGLES, ["zoom", true]];
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("remote-card", RemoteCard);
define("remote-mini-card", RemoteMiniCard);
define("remote-card-editor", RemoteCardEditor);
define("remote-mini-card-editor", RemoteMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "remote-card",
    name: "Remote Card",
    description: "Remote control for TVs and streaming boxes: D-pad, back, home, menu, volume, channels, transport, sources and apps (Apple TV, Android TV, Philips, Samsung, LG, Roku, Fire TV, Freebox, Kodi).",
  },
  { type: "remote-mini-card", name: "Remote Mini Card", description: "Compact remote: power, now playing, play / pause and volume, unfolding into the full remote." },
]) {
  if (!window.customCards.some((c) => c.type === card.type)) window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-remote-card" });
}

console.info(`%c REMOTE-CARD %c v${VERSION} `, "color: white; background: #7c4dff; font-weight: 700;", "color: #7c4dff; background: white; font-weight: 700;");
