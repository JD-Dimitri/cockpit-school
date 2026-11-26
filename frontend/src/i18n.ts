// Traduction de l'interface (I18N, demandes de l'auteur : « go i18n », « Fais anglais » le 24/11/2026,
// « implementer les autres langues (i18n) » le 26/11/2026).
// Étape 2 : 10 langues (fr, en, de, it, es, zh, ja, ko, hi, ar) pour l'en-tête, les menus, le bandeau, le pied de page,
// l'accueil public et l'accueil connecté. Le reste (moteur du simulateur, cours, QCM, documents) suivra.
// La langue choisie est mémorisée (clé « cs-lang »). Une clé absente dans une langue retombe sur le français.
import { useEffect, useState } from 'react';
import fr from '../assets/flags/fr.svg';
import en from '../assets/flags/en.svg';
import de from '../assets/flags/de.svg';
import it from '../assets/flags/it.svg';
import es from '../assets/flags/es.svg';
import zh from '../assets/flags/zh.svg';
import ja from '../assets/flags/ja.svg';
import ko from '../assets/flags/ko.svg';
import hi from '../assets/flags/hi.svg';
import ar from '../assets/flags/ar.svg';

export const LANGS = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية' },
] as const;
export type Lang = (typeof LANGS)[number]['code'];
const KEY = 'cs-lang';
const svg = (s: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
export const FLAGS: Record<Lang, string> = {
  fr: svg(fr), en: svg(en), de: svg(de), it: svg(it), es: svg(es), zh: svg(zh), ja: svg(ja), ko: svg(ko), hi: svg(hi), ar: svg(ar),
};
/** Sens d'écriture : l'arabe s'écrit de droite à gauche (appliqué aux seuls textes traduits). */
export const dirOf = (l: Lang): 'rtl' | 'ltr' => (l === 'ar' ? 'rtl' : 'ltr');

const FR = {
  'nav.simulateur': 'Simulateur', 'nav.cours': 'Cours', 'nav.admin': 'Admin', 'nav.signup': 'Créer un compte', 'nav.login': 'Connexion', 'demo.user': 'Démonstration hors ligne',
  'nav.aria': 'Navigation principale', 'lang.label': 'Langue', 'loading': 'Chargement…', 'login.required': 'Connexion requise…',
  'demo': "Version de démonstration hors ligne (sans compte), réservée aux essais. En ligne, le simulateur et les cours s'ouvrent après connexion.",
  'foot': 'Simulateur pédagogique : ne pas utiliser pour la navigation réelle. Données : statuts [RÉFÉRENCÉ] / [ESTIMÉ] / [SIMULÉ] affichés là où elles servent.',
  'home.h1': 'De zéro à la licence de pilote, et au-delà',
  'home.lead': "Version Pro en construction : interface React, 3D Three.js, et bientôt les comptes élèves (Symfony). Le simulateur d'origine fonctionne déjà ici, sans perte, pendant que ses modules sont portés un par un.",
  'card.sim.t': 'Simulateur', 'card.sim.d': 'Le simulateur complet : 8 appareils, parcours guidés, contrôle aérien, pannes, examens.',
  'card.cours.t': 'Cours', 'card.cours.d': "L'Académie : du premier cours au métier de pilote de ligne, avec QCM corrigés.",
  'card.apt.t': 'Aéroports', 'card.apt.d': 'Aéroports et pistes utilisés, avec leurs coordonnées.',
  'home.meta': 'Données extraites le {d} du moteur {e}.',
  'wel.h1': 'Apprendre à piloter, du premier cours au métier de pilote',
  'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR est une école de pilotage en ligne : cours, parcours guidés et simulateur de vol. Créez votre compte pour y accéder.',
  'wel.signup': 'Créer un compte', 'wel.login': 'Se connecter',
  'wel.p1t': 'Des parcours de pilote complets', 'wel.p1d': "De la visite prévol à l'arrêt des moteurs, sur avions de ligne, avion d'affaires, avion école et hélicoptères.",
  'wel.p2t': 'Une école théorique', 'wel.p2d': "Des cours du premier pas jusqu'au métier de pilote de ligne, avec exercices corrigés, téléchargeables en PDF.",
  'wel.p3t': 'Un simulateur de vol 3D', 'wel.p3d': 'Poste de pilotage, contrôle aérien, météo, pannes et examens, dans le navigateur.',
  'wel.p4t': 'Des données sourcées', 'wel.p4d': 'Chaque valeur porte son statut : référencée, calculée, estimée ou simulée.',
};
export type Key = keyof typeof FR;

const T: Record<Lang, Partial<Record<Key, string>>> = {
  fr: FR,
  en: {
    'nav.simulateur': 'Simulator', 'nav.cours': 'Courses', 'nav.admin': 'Admin', 'nav.signup': 'Create an account', 'nav.login': 'Log in', 'demo.user': 'Offline demo',
    'nav.aria': 'Main navigation', 'lang.label': 'Language', 'loading': 'Loading…', 'login.required': 'Login required…',
    'demo': 'Offline demonstration version (no account), for testing only. Online, the simulator and the courses open after logging in.',
    'foot': 'Training simulator: not for real-world navigation. Data: [REFERENCED] / [ESTIMATED] / [SIMULATED] status shown where it is used.',
    'home.h1': "From zero to a pilot's licence, and beyond",
    'home.lead': 'Pro version under construction: React interface, Three.js 3D, and soon student accounts (Symfony). The original simulator already runs here, with nothing lost, while its modules are ported one by one.',
    'card.sim.t': 'Simulator', 'card.sim.d': 'The full simulator: 8 aircraft, guided flights, air traffic control, failures, exams.',
    'card.cours.t': 'Courses', 'card.cours.d': 'The Academy: from the first lesson to airline pilot, with corrected quizzes.',
    'card.apt.t': 'Airports', 'card.apt.d': 'Airports and runways used, with their coordinates.',
    'home.meta': 'Data extracted on {d} from engine {e}.',
    'wel.h1': 'Learn to fly, from the first lesson to a pilot career',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR is an online flight school: courses, guided flights and a flight simulator. Create your account to get access.',
    'wel.signup': 'Create an account', 'wel.login': 'Log in',
    'wel.p1t': 'Complete pilot journeys', 'wel.p1d': 'From the pre-flight walkaround to engine shutdown, on airliners, a business jet, a trainer and helicopters.',
    'wel.p2t': 'A ground school', 'wel.p2d': 'Courses from the very first step to airline pilot, with corrected exercises, downloadable as PDF.',
    'wel.p3t': 'A 3D flight simulator', 'wel.p3d': 'Cockpit, air traffic control, weather, failures and exams, in the browser.',
    'wel.p4t': 'Sourced data', 'wel.p4d': 'Every value carries its status: referenced, calculated, estimated or simulated.',
  },
  de: {
    'nav.simulateur': 'Simulator', 'nav.cours': 'Kurse', 'nav.admin': 'Admin', 'nav.signup': 'Konto erstellen', 'nav.login': 'Anmelden', 'demo.user': 'Offline-Demo',
    'nav.aria': 'Hauptnavigation', 'lang.label': 'Sprache', 'loading': 'Wird geladen…', 'login.required': 'Anmeldung erforderlich…',
    'demo': 'Offline-Demoversion (ohne Konto), nur zum Testen. Online öffnen sich Simulator und Kurse nach der Anmeldung.',
    'foot': 'Lernsimulator: nicht für die reale Navigation verwenden. Daten: Status [BELEGT] / [GESCHÄTZT] / [SIMULIERT] wird dort angezeigt, wo sie verwendet werden.',
    'home.h1': 'Von null zur Pilotenlizenz – und darüber hinaus',
    'home.lead': 'Pro-Version im Aufbau: React-Oberfläche, 3D mit Three.js und bald Schülerkonten (Symfony). Der ursprüngliche Simulator läuft hier bereits vollständig, während seine Module nach und nach portiert werden.',
    'card.sim.t': 'Simulator', 'card.sim.d': 'Der komplette Simulator: 8 Luftfahrzeuge, geführte Flüge, Flugsicherung, Störungen, Prüfungen.',
    'card.cours.t': 'Kurse', 'card.cours.d': 'Die Akademie: von der ersten Lektion bis zum Linienpiloten, mit korrigierten Tests.',
    'card.apt.t': 'Flughäfen', 'card.apt.d': 'Verwendete Flughäfen und Pisten mit ihren Koordinaten.',
    'home.meta': 'Daten vom {d} aus dem Simulator {e} übernommen.',
    'wel.h1': 'Fliegen lernen – von der ersten Lektion bis zum Pilotenberuf',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR ist eine Online-Flugschule: Kurse, geführte Flüge und Flugsimulator. Erstellen Sie Ihr Konto, um Zugang zu erhalten.',
    'wel.signup': 'Konto erstellen', 'wel.login': 'Anmelden',
    'wel.p1t': 'Vollständige Pilotenabläufe', 'wel.p1d': 'Vom Vorflug-Check bis zum Abstellen der Triebwerke, auf Verkehrsflugzeugen, Businessjet, Schulflugzeug und Hubschraubern.',
    'wel.p2t': 'Eine Theorieschule', 'wel.p2d': 'Kurse vom ersten Schritt bis zum Linienpiloten, mit korrigierten Übungen, als PDF herunterladbar.',
    'wel.p3t': 'Ein 3D-Flugsimulator', 'wel.p3d': 'Cockpit, Flugsicherung, Wetter, Störungen und Prüfungen – im Browser.',
    'wel.p4t': 'Belegte Daten', 'wel.p4d': 'Jeder Wert trägt seinen Status: belegt, berechnet, geschätzt oder simuliert.',
  },
  it: {
    'nav.simulateur': 'Simulatore', 'nav.cours': 'Corsi', 'nav.admin': 'Admin', 'nav.signup': 'Crea un account', 'nav.login': 'Accedi', 'demo.user': 'Demo offline',
    'nav.aria': 'Navigazione principale', 'lang.label': 'Lingua', 'loading': 'Caricamento…', 'login.required': 'Accesso richiesto…',
    'demo': "Versione dimostrativa offline (senza account), riservata alle prove. Online, il simulatore e i corsi si aprono dopo l'accesso.",
    'foot': 'Simulatore didattico: non usare per la navigazione reale. Dati: stato [REFERENZIATO] / [STIMATO] / [SIMULATO] indicato dove vengono usati.',
    'home.h1': 'Da zero alla licenza di pilota, e oltre',
    'home.lead': "Versione Pro in costruzione: interfaccia React, 3D Three.js e presto gli account studente (Symfony). Il simulatore originale funziona già qui, senza perdite, mentre i suoi moduli vengono portati uno alla volta.",
    'card.sim.t': 'Simulatore', 'card.sim.d': 'Il simulatore completo: 8 velivoli, percorsi guidati, controllo del traffico aereo, avarie, esami.',
    'card.cours.t': 'Corsi', 'card.cours.d': "L'Accademia: dalla prima lezione al mestiere di pilota di linea, con quiz corretti.",
    'card.apt.t': 'Aeroporti', 'card.apt.d': 'Aeroporti e piste utilizzati, con le loro coordinate.',
    'home.meta': 'Dati estratti il {d} dal motore {e}.',
    'wel.h1': 'Imparare a pilotare, dalla prima lezione al mestiere di pilota',
    'wel.lead': "COCKPIT SCHOOL - PLANE SIMULATOR è una scuola di volo online: corsi, percorsi guidati e simulatore di volo. Crea il tuo account per accedervi.",
    'wel.signup': 'Crea un account', 'wel.login': 'Accedi',
    'wel.p1t': 'Percorsi completi da pilota', 'wel.p1d': "Dal giro d'ispezione prevolo allo spegnimento dei motori, su aerei di linea, business jet, aereo scuola ed elicotteri.",
    'wel.p2t': 'Una scuola teorica', 'wel.p2d': 'Corsi dal primo passo al mestiere di pilota di linea, con esercizi corretti, scaricabili in PDF.',
    'wel.p3t': 'Un simulatore di volo 3D', 'wel.p3d': 'Cabina di pilotaggio, controllo del traffico aereo, meteo, avarie ed esami, nel browser.',
    'wel.p4t': 'Dati con fonti', 'wel.p4d': 'Ogni valore riporta il suo stato: referenziato, calcolato, stimato o simulato.',
  },
  es: {
    'nav.simulateur': 'Simulador', 'nav.cours': 'Cursos', 'nav.admin': 'Admin', 'nav.signup': 'Crear una cuenta', 'nav.login': 'Iniciar sesión', 'demo.user': 'Demo sin conexión',
    'nav.aria': 'Navegación principal', 'lang.label': 'Idioma', 'loading': 'Cargando…', 'login.required': 'Se requiere iniciar sesión…',
    'demo': 'Versión de demostración sin conexión (sin cuenta), solo para pruebas. En línea, el simulador y los cursos se abren tras iniciar sesión.',
    'foot': 'Simulador didáctico: no usar para la navegación real. Datos: estado [REFERENCIADO] / [ESTIMADO] / [SIMULADO] indicado donde se usan.',
    'home.h1': 'De cero a la licencia de piloto, y más allá',
    'home.lead': 'Versión Pro en construcción: interfaz React, 3D con Three.js y pronto las cuentas de alumno (Symfony). El simulador original ya funciona aquí, sin pérdidas, mientras sus módulos se migran uno a uno.',
    'card.sim.t': 'Simulador', 'card.sim.d': 'El simulador completo: 8 aeronaves, recorridos guiados, control aéreo, averías, exámenes.',
    'card.cours.t': 'Cursos', 'card.cours.d': 'La Academia: de la primera clase al oficio de piloto de línea aérea, con cuestionarios corregidos.',
    'card.apt.t': 'Aeropuertos', 'card.apt.d': 'Aeropuertos y pistas utilizados, con sus coordenadas.',
    'home.meta': 'Datos extraídos el {d} del motor {e}.',
    'wel.h1': 'Aprender a pilotar, de la primera clase al oficio de piloto',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR es una escuela de vuelo en línea: cursos, recorridos guiados y simulador de vuelo. Cree su cuenta para acceder.',
    'wel.signup': 'Crear una cuenta', 'wel.login': 'Iniciar sesión',
    'wel.p1t': 'Recorridos de piloto completos', 'wel.p1d': 'De la inspección prevuelo a la parada de motores, en aviones de línea, avión de negocios, avión escuela y helicópteros.',
    'wel.p2t': 'Una escuela teórica', 'wel.p2d': 'Cursos desde el primer paso hasta piloto de línea aérea, con ejercicios corregidos, descargables en PDF.',
    'wel.p3t': 'Un simulador de vuelo 3D', 'wel.p3d': 'Cabina, control aéreo, meteorología, averías y exámenes, en el navegador.',
    'wel.p4t': 'Datos con fuentes', 'wel.p4d': 'Cada valor indica su estado: referenciado, calculado, estimado o simulado.',
  },
  zh: {
    'nav.simulateur': '模拟器', 'nav.cours': '课程', 'nav.admin': '管理', 'nav.signup': '创建账户', 'nav.login': '登录', 'demo.user': '离线演示',
    'nav.aria': '主导航', 'lang.label': '语言', 'loading': '加载中…', 'login.required': '需要登录…',
    'demo': '离线演示版（无需账户），仅供试用。在线版本中，模拟器和课程需登录后打开。',
    'foot': '教学模拟器：不得用于真实导航。数据：在使用处标注状态 [有据可查] / [估计] / [模拟]。',
    'home.h1': '从零到飞行执照，乃至更远',
    'home.lead': '专业版建设中：React 界面、Three.js 三维，学员账户（Symfony）即将推出。原版模拟器已在此完整运行，其模块正逐一移植。',
    'card.sim.t': '模拟器', 'card.sim.d': '完整模拟器：8 种机型、引导式飞行、空中交通管制、故障、考试。',
    'card.cours.t': '课程', 'card.cours.d': '学院：从第一课到航线飞行员，附带已批改的测验。',
    'card.apt.t': '机场', 'card.apt.d': '所用机场和跑道及其坐标。',
    'home.meta': '数据于 {d} 提取自引擎 {e}。',
    'wel.h1': '学习驾驶飞机，从第一课到飞行员职业',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR 是一所在线飞行学校：课程、引导式飞行和飞行模拟器。创建账户即可使用。',
    'wel.signup': '创建账户', 'wel.login': '登录',
    'wel.p1t': '完整的飞行员流程', 'wel.p1d': '从飞行前绕机检查到关闭发动机，涵盖客机、公务机、教练机和直升机。',
    'wel.p2t': '理论学校', 'wel.p2d': '从入门到航线飞行员的课程，附带已批改的练习，可下载 PDF。',
    'wel.p3t': '三维飞行模拟器', 'wel.p3d': '驾驶舱、空中交通管制、天气、故障和考试，均在浏览器中完成。',
    'wel.p4t': '有据可查的数据', 'wel.p4d': '每个数值都标注状态：有据可查、计算、估计或模拟。',
  },
  ja: {
    'nav.simulateur': 'シミュレーター', 'nav.cours': 'コース', 'nav.admin': '管理', 'nav.signup': 'アカウント作成', 'nav.login': 'ログイン', 'demo.user': 'オフラインデモ',
    'nav.aria': 'メインナビゲーション', 'lang.label': '言語', 'loading': '読み込み中…', 'login.required': 'ログインが必要です…',
    'demo': 'オフラインのデモ版（アカウント不要）で、試用専用です。オンラインでは、シミュレーターとコースはログイン後に開きます。',
    'foot': '教育用シミュレーターです。実際の航法には使用しないでください。データ：使用箇所に [出典あり] / [推定] / [シミュレーション] の区分を表示しています。',
    'home.h1': 'ゼロからパイロットライセンスへ、そしてその先へ',
    'home.lead': 'Pro 版を構築中：React インターフェース、Three.js による 3D、まもなく生徒アカウント（Symfony）。元のシミュレーターはすでにここで欠けることなく動作しており、各モジュールを順次移植しています。',
    'card.sim.t': 'シミュレーター', 'card.sim.d': '完全なシミュレーター：8 機種、ガイド付きフライト、航空管制、故障、試験。',
    'card.cours.t': 'コース', 'card.cours.d': 'アカデミー：最初の授業からエアラインパイロットまで、採点付きクイズ付き。',
    'card.apt.t': '空港', 'card.apt.d': '使用している空港と滑走路、その座標。',
    'home.meta': '{d} にエンジン {e} から抽出したデータ。',
    'wel.h1': '最初の授業からパイロットの仕事まで、操縦を学ぶ',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR はオンラインの飛行学校です：コース、ガイド付きフライト、フライトシミュレーター。アカウントを作成して利用できます。',
    'wel.signup': 'アカウント作成', 'wel.login': 'ログイン',
    'wel.p1t': '完全なパイロット手順', 'wel.p1d': '飛行前点検からエンジン停止まで。旅客機、ビジネスジェット、練習機、ヘリコプター。',
    'wel.p2t': '学科スクール', 'wel.p2d': '最初の一歩からエアラインパイロットまでのコース。採点付き演習、PDF でダウンロード可能。',
    'wel.p3t': '3D フライトシミュレーター', 'wel.p3d': 'コックピット、航空管制、気象、故障、試験をブラウザで。',
    'wel.p4t': '出典のあるデータ', 'wel.p4d': 'すべての値に区分を表示：出典あり、計算、推定、シミュレーション。',
  },
  ko: {
    'nav.simulateur': '시뮬레이터', 'nav.cours': '강좌', 'nav.admin': '관리', 'nav.signup': '계정 만들기', 'nav.login': '로그인', 'demo.user': '오프라인 데모',
    'nav.aria': '주 메뉴', 'lang.label': '언어', 'loading': '불러오는 중…', 'login.required': '로그인이 필요합니다…',
    'demo': '오프라인 데모 버전(계정 불필요)으로, 체험용입니다. 온라인에서는 로그인 후 시뮬레이터와 강좌가 열립니다.',
    'foot': '교육용 시뮬레이터입니다. 실제 항법에 사용하지 마십시오. 데이터: 사용되는 곳에 [출처 확인] / [추정] / [시뮬레이션] 상태를 표시합니다.',
    'home.h1': '제로에서 조종사 자격증까지, 그리고 그 너머로',
    'home.lead': 'Pro 버전 구축 중: React 인터페이스, Three.js 3D, 곧 학생 계정(Symfony). 원래 시뮬레이터는 이미 이곳에서 손실 없이 작동하며, 모듈을 하나씩 이식하고 있습니다.',
    'card.sim.t': '시뮬레이터', 'card.sim.d': '완전한 시뮬레이터: 항공기 8종, 안내 비행, 항공 교통 관제, 고장, 시험.',
    'card.cours.t': '강좌', 'card.cours.d': '아카데미: 첫 수업부터 민항기 조종사까지, 채점된 퀴즈 포함.',
    'card.apt.t': '공항', 'card.apt.d': '사용되는 공항과 활주로 및 좌표.',
    'home.meta': '{d}에 엔진 {e}에서 추출한 데이터.',
    'wel.h1': '첫 수업부터 조종사 직업까지, 비행을 배우세요',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR는 온라인 비행 학교입니다: 강좌, 안내 비행, 비행 시뮬레이터. 계정을 만들어 이용하세요.',
    'wel.signup': '계정 만들기', 'wel.login': '로그인',
    'wel.p1t': '완전한 조종사 절차', 'wel.p1d': '비행 전 점검부터 엔진 정지까지, 여객기, 비즈니스 제트기, 훈련기, 헬리콥터.',
    'wel.p2t': '이론 학교', 'wel.p2d': '첫걸음부터 민항기 조종사까지의 강좌, 채점된 연습 문제, PDF 다운로드 가능.',
    'wel.p3t': '3D 비행 시뮬레이터', 'wel.p3d': '조종석, 항공 교통 관제, 기상, 고장, 시험을 브라우저에서.',
    'wel.p4t': '출처가 있는 데이터', 'wel.p4d': '모든 값에 상태 표시: 출처 확인, 계산, 추정 또는 시뮬레이션.',
  },
  hi: {
    'nav.simulateur': 'सिम्युलेटर', 'nav.cours': 'पाठ्यक्रम', 'nav.admin': 'प्रशासन', 'nav.signup': 'खाता बनाएँ', 'nav.login': 'लॉग इन', 'demo.user': 'ऑफ़लाइन डेमो',
    'nav.aria': 'मुख्य नेविगेशन', 'lang.label': 'भाषा', 'loading': 'लोड हो रहा है…', 'login.required': 'लॉग इन आवश्यक है…',
    'demo': 'ऑफ़लाइन डेमो संस्करण (बिना खाते के), केवल परीक्षण के लिए। ऑनलाइन, सिम्युलेटर और पाठ्यक्रम लॉग इन के बाद खुलते हैं।',
    'foot': 'शैक्षिक सिम्युलेटर: वास्तविक नेविगेशन के लिए उपयोग न करें। डेटा: जहाँ उपयोग होता है वहाँ [संदर्भित] / [अनुमानित] / [सिम्युलेटेड] स्थिति दिखाई जाती है।',
    'home.h1': 'शून्य से पायलट लाइसेंस तक, और उससे आगे',
    'home.lead': 'Pro संस्करण निर्माणाधीन: React इंटरफ़ेस, Three.js 3D, और जल्द ही छात्र खाते (Symfony)। मूल सिम्युलेटर यहाँ पहले से बिना किसी कमी के चल रहा है, जबकि इसके मॉड्यूल एक-एक करके लाए जा रहे हैं।',
    'card.sim.t': 'सिम्युलेटर', 'card.sim.d': 'पूर्ण सिम्युलेटर: 8 विमान, निर्देशित उड़ानें, हवाई यातायात नियंत्रण, खराबियाँ, परीक्षाएँ।',
    'card.cours.t': 'पाठ्यक्रम', 'card.cours.d': 'अकादमी: पहले पाठ से एयरलाइन पायलट तक, जाँचे गए प्रश्नोत्तरी सहित।',
    'card.apt.t': 'हवाई अड्डे', 'card.apt.d': 'उपयोग किए गए हवाई अड्डे और रनवे, उनके निर्देशांकों सहित।',
    'home.meta': '{d} को इंजन {e} से निकाला गया डेटा।',
    'wel.h1': 'उड़ान सीखें, पहले पाठ से पायलट के पेशे तक',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR एक ऑनलाइन फ़्लाइट स्कूल है: पाठ्यक्रम, निर्देशित उड़ानें और फ़्लाइट सिम्युलेटर। पहुँच के लिए अपना खाता बनाएँ।',
    'wel.signup': 'खाता बनाएँ', 'wel.login': 'लॉग इन करें',
    'wel.p1t': 'पूर्ण पायलट प्रक्रियाएँ', 'wel.p1d': 'उड़ान-पूर्व निरीक्षण से इंजन बंद करने तक, यात्री विमानों, बिज़नेस जेट, प्रशिक्षण विमान और हेलीकॉप्टरों पर।',
    'wel.p2t': 'एक सैद्धांतिक स्कूल', 'wel.p2d': 'पहले कदम से एयरलाइन पायलट तक के पाठ्यक्रम, जाँचे गए अभ्यासों सहित, PDF में डाउनलोड योग्य।',
    'wel.p3t': 'एक 3D फ़्लाइट सिम्युलेटर', 'wel.p3d': 'कॉकपिट, हवाई यातायात नियंत्रण, मौसम, खराबियाँ और परीक्षाएँ, ब्राउज़र में।',
    'wel.p4t': 'स्रोत-सहित डेटा', 'wel.p4d': 'हर मान अपनी स्थिति दिखाता है: संदर्भित, गणना की गई, अनुमानित या सिम्युलेटेड।',
  },
  ar: {
    'nav.simulateur': 'المحاكي', 'nav.cours': 'الدروس', 'nav.admin': 'الإدارة', 'nav.signup': 'إنشاء حساب', 'nav.login': 'تسجيل الدخول', 'demo.user': 'عرض تجريبي دون اتصال',
    'nav.aria': 'التنقل الرئيسي', 'lang.label': 'اللغة', 'loading': 'جارٍ التحميل…', 'login.required': 'يلزم تسجيل الدخول…',
    'demo': 'نسخة تجريبية دون اتصال (بلا حساب)، مخصصة للتجربة فقط. عبر الإنترنت، يُفتح المحاكي والدروس بعد تسجيل الدخول.',
    'foot': 'محاكٍ تعليمي: لا يُستخدم للملاحة الفعلية. البيانات: تُعرض الحالة [موثّق] / [تقديري] / [محاكى] حيث تُستخدم.',
    'home.h1': 'من الصفر إلى رخصة الطيار، وما بعدها',
    'home.lead': 'النسخة الاحترافية قيد الإنشاء: واجهة React، وثلاثي الأبعاد Three.js، وقريبًا حسابات الطلاب (Symfony). المحاكي الأصلي يعمل هنا بالفعل كاملًا، بينما تُنقل وحداته واحدة تلو الأخرى.',
    'card.sim.t': 'المحاكي', 'card.sim.d': 'المحاكي الكامل: 8 طائرات، رحلات موجّهة، مراقبة جوية، أعطال، امتحانات.',
    'card.cours.t': 'الدروس', 'card.cours.d': 'الأكاديمية: من الدرس الأول إلى مهنة طيار الخطوط الجوية، مع اختبارات مصحّحة.',
    'card.apt.t': 'المطارات', 'card.apt.d': 'المطارات والمدارج المستخدمة مع إحداثياتها.',
    'home.meta': 'بيانات مستخرجة في {d} من المحرك {e}.',
    'wel.h1': 'تعلّم الطيران، من الدرس الأول إلى مهنة الطيار',
    'wel.lead': 'COCKPIT SCHOOL - PLANE SIMULATOR مدرسة طيران عبر الإنترنت: دروس ورحلات موجّهة ومحاكي طيران. أنشئ حسابك للوصول إليها.',
    'wel.signup': 'إنشاء حساب', 'wel.login': 'تسجيل الدخول',
    'wel.p1t': 'مسارات طيار كاملة', 'wel.p1d': 'من الفحص قبل الطيران إلى إيقاف المحركات، على طائرات الركاب وطائرة رجال الأعمال وطائرة التدريب والمروحيات.',
    'wel.p2t': 'مدرسة نظرية', 'wel.p2d': 'دروس من الخطوة الأولى إلى طيار الخطوط الجوية، مع تمارين مصحّحة، قابلة للتنزيل بصيغة PDF.',
    'wel.p3t': 'محاكي طيران ثلاثي الأبعاد', 'wel.p3d': 'قمرة القيادة والمراقبة الجوية والطقس والأعطال والامتحانات، في المتصفح.',
    'wel.p4t': 'بيانات موثّقة المصدر', 'wel.p4d': 'كل قيمة تحمل حالتها: موثّقة أو محسوبة أو تقديرية أو محاكاة.',
  },
};

function stored(): Lang {
  try { const v = localStorage.getItem(KEY); return (LANGS.find((x) => x.code === v)?.code ?? 'fr') as Lang; } catch { return 'fr'; }
}
let current: Lang = stored();
const subs = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* mémoire seulement */ }
  document.documentElement.lang = l;
  subs.forEach((f) => f(l));
}
/** Langue active + fonction de traduction ; le composant se redessine quand la langue change. */
export function useLang(): [Lang, (k: Key, v?: Record<string, string>) => string] {
  const [l, set] = useState<Lang>(current);
  useEffect(() => { subs.add(set); document.documentElement.lang = current; return () => { subs.delete(set); }; }, []);
  return [l, (k: Key, v?: Record<string, string>) => {
    let s = T[l][k] ?? FR[k];
    if (v) for (const [a, b] of Object.entries(v)) s = s.split('{' + a + '}').join(b);
    return s;
  }];
}
/** Format de date propre à la langue (accueil). */
export const LOCALE: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE', it: 'it-IT', es: 'es-ES', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN', ar: 'ar' };
