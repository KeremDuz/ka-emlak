import type { PageContents } from '../types';

// Deutsche Übersetzung der Seitentexte. Grundlage ist der türkische Text; Platzhalter in eckigen Klammern bleiben unverändert.
const PHONE = '0532 224 76 58';
const UPDATED = 'PLACEHOLDER_DATE';
const NOTE = 'Dieser deutsche Text ist eine Übersetzung zu Ihrer Information. Bei Abweichungen zwischen den Fassungen ist der türkische Text maßgeblich.';
const CONTRACT_NOTE = 'KA EMLAK bietet Immobilienberatung, aber keine Rechtsberatung. Die Angaben auf dieser Seite dienen der allgemeinen Information. Wir empfehlen, den Vertrag vor der Unterschrift von einem unabhängigen Rechtsanwalt prüfen zu lassen.';

export const de: PageContents = {
  katKarsiligi: {
    metaTitle: 'Bauen gegen Wohnungsanteile: für Grundstückseigentümer | KA EMLAK',
    metaDescription:
      'Möchten Sie Ihr Grundstück in Antalya gegen Wohnungsanteile bebauen lassen? KA EMLAK prüft das Grundstück, holt Angebote von Bauunternehmern ein und erklärt sie Ihnen. Die Erstbewertung ist kostenlos.',
    title: 'Bauen gegen Wohnungsanteile',
    intro:
      'Sie können Ihr Grundstück nutzen, ohne es zu verkaufen: Sie erhalten Wohnungen in dem Gebäude, das darauf errichtet wird. KA EMLAK bringt in Antalya Grundstückseigentümer und Bauunternehmer zusammen und führt die Gespräche.',
    sections: [
      {
        heading: 'Was bedeutet Bauen gegen Wohnungsanteile (kat karşılığı)?',
        paragraphs: [
          'Beim Bauen gegen Wohnungsanteile überlässt der Eigentümer sein Grundstück einem Bauunternehmer, der das Gebäude auf eigene Kosten errichtet. Nach Fertigstellung erhält der Eigentümer einen Teil der Wohnungen, der Rest bleibt beim Bauunternehmer. Der Eigentümer zahlt keine Baukosten; im Gegenzug überträgt er einen Teil seines Grundstücks an den Bauunternehmer.',
        ],
      },
      {
        heading: 'So läuft es mit KA EMLAK ab',
        paragraphs: [
          'Eignet sich Ihr Grundstück nicht für dieses Modell, besprechen wir auch andere Möglichkeiten, etwa den Verkauf oder den Bau einer Villa in Leichtstahlbauweise.',
        ],
        bullets: [
          `Sie füllen das Formular unten aus oder rufen ${PHONE} an. Wir nehmen die Lage des Grundstücks und die Grundbuchangaben auf.`,
          'Wir prüfen Lage, Bebauungsplan und Verkäufe in der Umgebung.',
          'Wir rufen Sie an und nennen Ihnen den ungefähren Wert des Grundstücks und ob es sich für das Modell eignet. Diese Erstbewertung ist kostenlos.',
          'Mit Ihrer Zustimmung stellen wir das Grundstück Bauunternehmern vor und erklären Ihnen die eingegangenen Angebote im Vergleich.',
          'Wählen Sie ein Angebot, werden die Bedingungen mit Ihrem Rechtsanwalt geklärt und der Vertrag wird beim Notar unterzeichnet.',
        ],
        ordered: true,
      },
      {
        heading: 'Welche Angaben bereitliegen sollten',
        paragraphs: [
          'Sie müssen nicht alles wissen. Landkreis, Viertel, Block- und Parzellennummer genügen für den Anfang.',
        ],
        bullets: [
          'Grundbuchangaben: Landkreis, Viertel, Block- und Parzellennummer',
          'Größe des Grundstücks in m²',
          'Falls bekannt, der Bebauungsplan (Wohnen, Gewerbe, Anzahl der Geschosse usw.)',
          'Lage des Grundstücks: Adresse oder Kartenposition',
          'Wie viele Eigentümer im Grundbuch stehen, falls es mehrere sind',
        ],
      },
      {
        heading: 'Was das Aufteilungsverhältnis beeinflusst',
        paragraphs: [
          'Das Verhältnis wird für jedes Grundstück einzeln festgelegt. Ohne das Grundstück zu prüfen, nennen wir kein Verhältnis.',
        ],
        bullets: [
          'Lage: Landkreis, Viertel und Lage des Grundstücks zur Haupt- oder Nebenstraße',
          'Bebauungsplan: wie viel gebaut werden darf und welche Nutzung zulässig ist',
          'Größe und Zuschnitt des Grundstücks',
          'Ob auf dem Grundstück ein Gebäude steht oder es im Grundbuch Miteigentumsanteile gibt',
        ],
      },
      {
        heading: 'Hinweis zum Vertrag',
        paragraphs: [
          'Die verbindlichen Bedingungen legt der notarielle Vertrag fest: Er regelt, welche Wohnungen wem gehören, den Übergabetermin und die Folgen einer Verzögerung.',
          CONTRACT_NOTE,
        ],
      },
    ],
    formTitle: 'Kostenlose Grundstücksbewertung',
    formIntro: 'Tragen Sie die Angaben zu Ihrem Grundstück ein. Die Bewertung ist kostenlos; nach der Prüfung rufen wir Sie an.',
    cta: 'Antrag senden',
  },

  kentselDonusum: {
    metaTitle: 'Stadterneuerung: für Eigentümer in alten Gebäuden | KA EMLAK',
    metaDescription:
      'Möchten Sie Ihr altes oder erdbebengefährdetes Gebäude in Antalya erneuern? KA EMLAK bewertet die Wohnungen, erklärt die Möglichkeiten und bringt die Eigentümer mit Bauunternehmern zusammen.',
    title: 'Stadterneuerung',
    intro:
      'Besitzen Sie eine Wohnung in einem alten oder nicht erdbebensicheren Gebäude, kann das Gebäude abgerissen und neu gebaut werden. KA EMLAK ermittelt den Wert der Wohnungen, erklärt die Möglichkeiten und führt die Eigentümer mit Bauunternehmern zusammen.',
    sections: [
      {
        heading: 'Was ist Stadterneuerung (kentsel dönüşüm)?',
        paragraphs: [
          'Bei der Stadterneuerung wird ein als gefährdet eingestuftes Gebäude abgerissen und durch einen Neubau nach den geltenden Bauvorschriften ersetzt. Die Entscheidung treffen die Wohnungseigentümer gemeinsam. Der Neubau entsteht meist über eine Vereinbarung „Bauen gegen Wohnungsanteile“ mit einem Bauunternehmer; die Eigentümer können das Gebäude auch verkaufen.',
        ],
      },
      {
        heading: 'Wann ein Gebäude darunter fällt',
        paragraphs: [
          'Grundsätzlich muss das Gebäude als gefährdetes Bauwerk festgestellt werden. Diese Feststellung treffen befugte Stellen nach einer technischen Prüfung des Gebäudes. Das Alter allein ist nicht entscheidend; maßgeblich ist das technische Gutachten.',
          'Regeln und staatliche Förderungen ändern sich mit der Zeit. Lassen Sie sich die aktuellen Bedingungen, die nötige Mehrheit und mögliche Förderungen bei der Gemeinde und der Provinzdirektion des Ministeriums für Umwelt, Urbanisierung und Klimawandel bestätigen.',
        ],
      },
      {
        heading: 'Was KA EMLAK übernimmt',
        paragraphs: [
          'Die Feststellung als gefährdetes Gebäude, die Baugenehmigung und andere amtliche Schritte übernehmen die befugten Stellen und die Gemeinde. Unser Büro führt diese Verfahren nicht durch; wir helfen bei Bewertung, Suche nach Bauunternehmern und den Verhandlungen.',
        ],
        bullets: [
          `Sie füllen das Formular unten aus oder rufen ${PHONE} an. Wir erfragen die Lage des Gebäudes und die Zahl der Einheiten.`,
          'Wir ermitteln den ungefähren heutigen Wert der Wohnungen und des Grundstücks.',
          'Wir erklären die Möglichkeiten: Neubau mit einem Bauunternehmer, gemeinsamer Verkauf des Gebäudes oder Verkauf Ihres Anteils.',
          'Wenn die Eigentümer es wünschen, holen wir Angebote von Bauunternehmern ein und erklären sie im Vergleich.',
          'Einigen sich die Eigentümer auf ein Angebot, werden die Bedingungen mit Rechtsanwälten geklärt und der Vertrag wird beim Notar unterzeichnet.',
        ],
        ordered: true,
      },
      {
        heading: 'Welche Angaben bereitliegen sollten',
        paragraphs: [
          'Vielleicht haben Sie nicht alle Angaben. Adresse und Grundbuchangaben des Gebäudes genügen für das erste Gespräch.',
        ],
        bullets: [
          'Adresse des Gebäudes',
          'Grundbuchangaben: Landkreis, Viertel, Block- und Parzellennummer',
          'Anzahl der Wohnungen und Läden im Gebäude',
          'Wie viele Eigentümer es gibt und wie sie zur Erneuerung stehen',
          'Falls vorhanden, das Gutachten zur Gefährdung des Gebäudes',
        ],
      },
      {
        heading: 'Hinweis zum Vertrag',
        paragraphs: [
          'Die verbindlichen Bedingungen legt der notarielle Vertrag fest: Er regelt, welche Wohnung wem zufällt, den Übergabetermin und die Miete während der Bauzeit.',
          CONTRACT_NOTE,
        ],
      },
    ],
    formTitle: 'Kostenlose Bewertung anfragen',
    formIntro: 'Tragen Sie die Angaben zum Gebäude ein. Die Bewertung ist kostenlos; nach der Prüfung rufen wir Sie an.',
    cta: 'Antrag senden',
  },

  yatirim: {
    metaTitle: 'Inserate für Anleger in Antalya | KA EMLAK',
    metaDescription:
      'Wohnungen, Grundstücke und Ferienmietobjekte von KA EMLAK in Antalya, die sich zum Vermieten oder späteren Verkauf eignen. Kurze Hinweise für ausländische Käufer.',
    title: 'Inserate für Anleger',
    intro:
      'Hier finden Sie Wohnungen, Grundstücke und für Ferienvermietung geeignete Objekte, die sich zum Vermieten oder für einen späteren Verkauf eignen. Wir geben keine Renditeprognosen; Preis, Lage und Zustand stehen auf der jeweiligen Inseratsseite.',
    notesTitle: 'Hinweise für ausländische Käufer',
    notes: [
      'Der Kauf wird durch ein amtliches Verfahren beim Grundbuchamt abgeschlossen, und die Immobilie wird auf den Namen des Käufers im Grundbuch (Tapu) eingetragen.',
      'Dafür benötigen Sie eine türkische Steuernummer und ein Bankkonto in der Türkei.',
      'Auf Wunsch vermitteln wir Ihnen einen vereidigten Dolmetscher und einen Rechtsanwalt. Unser Büro bietet keine Rechts- oder Finanzberatung.',
      'Die Regeln zu Staatsbürgerschaft, Aufenthaltserlaubnis, Steuern und Immobilienerwerb durch Ausländer ändern sich. Lassen Sie sich die aktuelle Lage vor Ihrer Entscheidung von einem Rechtsanwalt bestätigen.',
    ],
  },

  arsaFormu: {
    title: 'Kostenlose Grundstücksbewertung',
    intro: 'Die Bewertung ist kostenlos; nach Prüfung Ihrer Angaben rufen wir Sie an.',
    fields: {
      fullName: { label: 'Vor- und Nachname', placeholder: '', help: '' },
      phone: { label: 'Telefon', placeholder: '+90 5xx xxx xx xx', help: 'Wir rufen Sie unter dieser Nummer an.' },
      applicationType: { label: 'Art des Antrags', placeholder: '', help: '' },
      district: { label: 'Landkreis (İlçe)', placeholder: 'Zum Beispiel: Konyaaltı', help: '' },
      neighbourhood: { label: 'Viertel (Mahalle)', placeholder: '', help: '' },
      block: { label: 'Block (Ada)', placeholder: '', help: 'Steht im Grundbuchauszug (Tapu). Lassen Sie das Feld leer, wenn Sie es nicht wissen.' },
      parcel: { label: 'Parzelle (Parsel)', placeholder: '', help: 'Steht im Grundbuchauszug (Tapu). Lassen Sie das Feld leer, wenn Sie es nicht wissen.' },
      areaM2: { label: 'Grundstücksgröße (m²)', placeholder: 'Zum Beispiel: 650', help: 'Ein ungefährer Wert genügt.' },
      zoning: { label: 'Bebauungsplan', placeholder: '', help: '' },
      hasBuilding: { label: 'Steht ein Gebäude auf dem Grundstück?', placeholder: '', help: '' },
      note: { label: 'Anmerkung', placeholder: 'Was Sie ergänzen möchten', help: 'Hier können Sie etwa die Zahl der Miteigentümer oder den Zustand des bestehenden Gebäudes angeben.' },
    },
    options: {
      applicationType: { katKarsiligi: 'Bauen gegen Wohnungsanteile', kentselDonusum: 'Stadterneuerung', degerleme: 'Bewertung' },
      zoning: { unknown: 'Weiß ich nicht', residential: 'Wohnen', commercial: 'Gewerbe', mixed: 'Wohnen + Gewerbe', other: 'Sonstiges' },
      hasBuilding: { yes: 'Ja', no: 'Nein' },
    },
    optionalTag: 'optional',
    consent: 'Ich habe {privacy} gelesen und bin einverstanden, zu meinem Antrag angerufen zu werden.',
    privacyLinkLabel: 'den KVKK-Datenschutzhinweis',
    submit: 'Antrag senden',
    submitting: 'Wird gesendet',
    validation: {
      required: 'Bitte füllen Sie dieses Feld aus.',
      fullName: 'Bitte geben Sie Vor- und Nachnamen ein.',
      phone: 'Bitte geben Sie die Telefonnummer mit Vorwahl ein.',
      applicationType: 'Bitte wählen Sie die Art des Antrags.',
      district: 'Bitte geben Sie den Landkreis an, in dem das Grundstück liegt.',
      areaM2: 'Bitte geben Sie die Grundstücksgröße nur in Ziffern an.',
      zoning: 'Bitte wählen Sie den Bebauungsplan. Wenn Sie ihn nicht kennen, wählen Sie „Weiß ich nicht“.',
      hasBuilding: 'Bitte wählen Sie, ob ein Gebäude auf dem Grundstück steht.',
      noteTooLong: 'Die Anmerkung ist zu lang. Bitte kürzen Sie sie.',
      consent: 'Bitte setzen Sie das Häkchen, um den Antrag zu senden.',
    },
    success: { title: 'Ihr Antrag ist bei uns angekommen', text: 'Wir prüfen die Angaben und rufen Sie unter der angegebenen Nummer an.' },
    error: {
      generic: `Der Antrag konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie ${PHONE} an.`,
      network: 'Es konnte keine Internetverbindung hergestellt werden. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      tooMany: 'In kurzer Zeit gab es zu viele Versuche. Bitte versuchen Sie es gleich noch einmal.',
    },
  },

  kariyer: {
    metaTitle: 'Wir suchen Immobilienberater',
    metaDescription:
      'KA Global Real Estate sucht Immobilienberater für sein Büro in Konyaaltı, Antalya: 50 % Nettoprovision, Kundenanfragen über das Büro und ein Büro in einem Geschäftshaus in Öğretmenevleri.',
    title: 'Wir suchen Immobilienberater für unser Team',
    intro:
      'KA Global Real Estate baut ein neues Team auf. Für unser Büro in Konyaaltı, Antalya, suchen wir Immobilienberater, mit denen wir zusammenarbeiten.',
    sections: [
      {
        heading: 'Was wir bieten',
        paragraphs: [],
        bullets: [
          '50 % Nettoprovision',
          'Einschließlich der Kundenanfragen, die ins Büro kommen',
          'Arbeit in einem Büro in einem Geschäftshaus im Viertel Öğretmenevleri, Konyaaltı',
          'Vorteil des frühen Einstiegs in ein neu aufgebautes Team',
        ],
      },
      {
        heading: 'Wer sich bewerben kann',
        paragraphs: [
          'Bewerben können sich alle, die Erfahrung mitbringen oder neu in der Branche sind und offen für Verkauf und Lernen sind. Wenn Sie Ihr Einkommen selbst bestimmen und Teil eines starken Teams sein möchten, lernen Sie uns kennen.',
        ],
      },
    ],
    applyTitle: 'So bewerben Sie sich',
    applyText: `Rufen Sie İshak Kahraman für Ihre Bewerbung unter ${PHONE} an oder schreiben Sie per WhatsApp.`,
    callLabel: 'Anrufen',
    whatsappLabel: 'Per WhatsApp schreiben',
    whatsappMessage: 'Hallo, ich möchte mich auf Ihre Stelle als Immobilienberater bewerben.',
  },

  legal: {
    kvkk: {
      metaTitle: 'Datenschutzhinweis (KVKK) | KA EMLAK',
      metaDescription:
        'Informationshinweis dazu, welche personenbezogenen Daten die Website von KA EMLAK zu welchem Zweck und auf welcher Rechtsgrundlage verarbeitet, und zu Ihren Rechten nach dem türkischen Gesetz Nr. 6698.',
      title: 'Informationshinweis zum Schutz personenbezogener Daten',
      intro:
        'Dieser Hinweis erklärt gemäß dem türkischen Gesetz Nr. 6698 zum Schutz personenbezogener Daten (KVKK, „das Gesetz“), wie Ihre personenbezogenen Daten verarbeitet werden, wenn Sie diese Website nutzen und sich an uns wenden.',
      updated: UPDATED,
      languageNote: NOTE,
      sections: [
        {
          heading: 'Verantwortlicher',
          paragraphs: [
            'Ihre personenbezogenen Daten werden von [VERİ SORUMLUSU UNVANI] („KA EMLAK“) als Verantwortlichem verarbeitet.',
            `Adresse: [ADRES]. E-Mail: [E-POSTA]. Telefon: ${PHONE}. Steuer-/MERSİS-Nummer: [VERGİ/MERSİS NO]. Maklerlizenz (Taşınmaz Ticareti Yetki Belgesi) Nr.: 0702648.`,
          ],
        },
        {
          heading: 'Verarbeitete personenbezogene Daten',
          paragraphs: ['Wir verarbeiten nur die Daten, die Sie uns geben, und die Daten, die für den Betrieb der Website nötig sind.'],
          bullets: [
            'Identitätsdaten: Vor- und Nachname',
            'Kontaktdaten: Telefonnummer',
            'Anfragedaten: Ihre Nachricht und die Referenz des Inserats, für das Sie sich interessieren',
            'Daten des Grundstücksantrags: Art des Antrags, Landkreis, Viertel, Block, Parzelle, Grundstücksgröße, Bebauungsplan, ob ein Gebäude auf dem Grundstück steht, und Ihre Anmerkung',
            'Technische Daten: IP-Adresse und Browserangaben, die der Hosting-Anbieter beim Ausliefern der Website verarbeitet',
            'Mit Ihrer Einwilligung Nutzungsdaten: Seitenaufrufe sowie Klicks auf die Schaltflächen für WhatsApp, Telefon und Formulare',
          ],
        },
        {
          heading: 'Zwecke der Verarbeitung',
          paragraphs: ['Wir verarbeiten Ihre Daten zu folgenden Zwecken.'],
          bullets: [
            'Ihre Frage oder Ihren Antrag beantworten und Sie anrufen',
            'Sie über das Inserat informieren, für das Sie sich interessieren, und einen Termin vereinbaren',
            'Ein Grundstück oder Gebäude bewerten',
            'Den sicheren und unterbrechungsfreien Betrieb der Website gewährleisten',
            'Gesetzliche Pflichten erfüllen',
            'Mit Ihrer Einwilligung messen, wie die Website genutzt wird',
          ],
        },
        {
          heading: 'Erhebungsweise und Rechtsgrundlagen',
          paragraphs: [
            'Ihre Daten werden elektronisch erhoben, wenn Sie Formulare auf der Website ausfüllen, uns per Telefon oder WhatsApp kontaktieren und die Website besuchen. Die Verarbeitung stützt sich auf folgende Rechtsgrundlagen aus Artikel 5 des Gesetzes.',
          ],
          bullets: [
            'Unmittelbarer Zusammenhang mit dem Abschluss oder der Erfüllung eines Vertrags: Prüfung Ihrer Anfrage und Ihres Antrags',
            'Erforderlichkeit zur Erfüllung einer rechtlichen Pflicht des Verantwortlichen',
            'Berechtigtes Interesse des Verantwortlichen, sofern Ihre Grundrechte und -freiheiten nicht verletzt werden: Sicherheit und Betrieb der Website',
            'Ihre ausdrückliche Einwilligung: Analysemessung. Sie können Ihre Einwilligung jederzeit widerrufen.',
          ],
        },
        {
          heading: 'Empfänger der Daten',
          paragraphs: [
            'Wir verkaufen Ihre Daten nicht und geben sie nicht zu Werbezwecken weiter. Die Daten werden nur an die folgenden Empfänger und nur für den genannten Zweck übermittelt.',
            'Die Server dieser Dienstleister können sich im Ausland befinden. In diesem Fall werden Ihre Daten gemäß den Bestimmungen des Gesetzes über die Übermittlung ins Ausland übermittelt.',
          ],
          bullets: [
            'Cloudflare: Hosting und Auslieferung der Website',
            'Supabase: Datenbank, in der Anträge und Inserate gespeichert werden',
            'Google (Google Analytics 4): nur mit Ihrer ausdrücklichen Einwilligung, Nutzungsmessung',
            'Zuständige Behörden und öffentliche Stellen: wenn gesetzlich vorgeschrieben',
          ],
        },
        {
          heading: 'Speicherdauer',
          paragraphs: [
            'Wir speichern Ihre Daten, bis Ihre Anfrage abgeschlossen ist, und danach für die gesetzlich vorgesehenen Fristen. Nach Ablauf löschen, vernichten oder anonymisieren wir die Daten.',
          ],
        },
        {
          heading: 'Ihre Rechte nach Artikel 11 des Gesetzes',
          paragraphs: ['Wenden Sie sich an den Verantwortlichen, um folgende Rechte auszuüben.'],
          bullets: [
            'Erfahren, ob Ihre personenbezogenen Daten verarbeitet werden',
            'Falls ja, Auskunft darüber verlangen',
            'Den Zweck der Verarbeitung erfahren und ob die Daten zweckgemäß verwendet werden',
            'Die Dritten im In- und Ausland kennen, an die Daten übermittelt werden',
            'Die Berichtigung unvollständig oder falsch verarbeiteter Daten verlangen',
            'Die Löschung oder Vernichtung im Rahmen der gesetzlichen Voraussetzungen verlangen',
            'Verlangen, dass Berichtigung, Löschung und Vernichtung den Dritten mitgeteilt werden, an die die Daten übermittelt wurden',
            'Widerspruch einlegen, wenn durch ausschließlich automatisierte Auswertung ein für Sie nachteiliges Ergebnis entsteht',
            'Ersatz des Schadens verlangen, der Ihnen durch rechtswidrige Verarbeitung entstanden ist',
          ],
        },
        {
          heading: 'Antragsweg',
          paragraphs: [
            'Ihre Anliegen können Sie schriftlich mit Angaben zur Überprüfung Ihrer Identität an [ADRES] oder per E-Mail an [E-POSTA] richten.',
            'Wir beantworten Ihren Antrag innerhalb der gesetzlichen Frist. Halten Sie die Antwort für unzureichend oder erhalten Sie keine Antwort, können Sie sich bei der türkischen Datenschutzbehörde (Kişisel Verileri Koruma Kurulu) beschweren.',
          ],
        },
      ],
    },
    privacy: {
      metaTitle: 'Datenschutz | KA EMLAK',
      metaDescription:
        'Kurze Erklärung, welche Angaben die Website von KA EMLAK von Ihnen erhält, wofür sie verwendet werden und wer sie sieht.',
      title: 'Datenschutz',
      intro:
        'Diese Seite erklärt kurz, welche Angaben die Website von Ihnen erhält und was damit geschieht. Einzelheiten finden Sie im KVKK-Datenschutzhinweis.',
      updated: UPDATED,
      languageNote: NOTE,
      sections: [
        {
          heading: 'Welche Angaben wir erhalten',
          paragraphs: [
            'Zum Ansehen der Website müssen Sie nichts angeben. Nur wenn Sie ein Formular ausfüllen, erhalten wir folgende Angaben.',
          ],
          bullets: [
            'Ihren Namen und Ihre Telefonnummer',
            'Falls angegeben, Ihre Nachricht und die Referenz des Inserats, für das Sie sich interessieren',
            'Beim Grundstücksantrag: Art des Antrags, Landkreis, Viertel, Block, Parzelle, Fläche, Bebauungsplan, Angaben zum bestehenden Gebäude und Ihre Anmerkung',
          ],
        },
        {
          heading: 'Wofür wir die Angaben verwenden',
          paragraphs: [
            'Wir verwenden Ihre Angaben, um Sie anzurufen, Ihre Frage zu beantworten und ein Grundstück oder Gebäude zu bewerten. Wir zeigen keine Werbung und nutzen Ihre Angaben nicht für Werbezwecke.',
          ],
        },
        {
          heading: 'Wer die Angaben sieht',
          paragraphs: [
            'Ihren Antrag sieht KA EMLAK. Die Website wird bei Cloudflare gehostet, Anträge werden in einer Supabase-Datenbank gespeichert; die Server dieser Anbieter können im Ausland stehen. Wir verkaufen Ihre Angaben nicht.',
            'Wenn Sie uns per Telefon oder WhatsApp kontaktieren, gelten für das Gespräch die Bedingungen des jeweiligen Dienstes.',
          ],
        },
        {
          heading: 'Cookies und Messung',
          paragraphs: [
            'Die Website nutzt einige Browsereinträge, die für ihren Betrieb nötig sind. Google Analytics 4 läuft nur mit Ihrer Einwilligung; ohne Einwilligung wird kein Analyse-Cookie gesetzt. Einzelheiten stehen in der Cookie-Richtlinie.',
          ],
        },
        {
          heading: 'Wie lange die Angaben gespeichert werden',
          paragraphs: [
            'Wir speichern Ihre Angaben, bis Ihre Anfrage abgeschlossen ist, und so lange, wie es gesetzlich erforderlich ist. Wenn Sie eine frühere Löschung wünschen, schreiben Sie uns.',
          ],
        },
        {
          heading: 'Ihre Rechte und Kontakt',
          paragraphs: [
            `Sie können fragen, welche Angaben über Sie gespeichert sind, und deren Berichtigung oder Löschung verlangen. Schreiben Sie dazu an [E-POSTA] oder rufen Sie ${PHONE} an.`,
          ],
        },
      ],
    },
    cookies: {
      metaTitle: 'Cookie-Richtlinie | KA EMLAK',
      metaDescription:
        'Die notwendigen und Analyse-Cookies der Website von KA EMLAK, die Einwilligung für Google Analytics 4 und wie Sie Ihre Wahl ändern.',
      title: 'Cookie-Richtlinie',
      intro:
        'Diese Seite erklärt, welche Einträge die Website in Ihrem Browser speichert und wie Sie Ihre Wahl ändern können.',
      updated: UPDATED,
      languageNote: NOTE,
      sections: [
        {
          heading: 'Was ist ein Cookie?',
          paragraphs: [
            'Ein Cookie ist eine kleine Information, die eine Website in Ihrem Browser speichert. Auf dieser Seite umfasst das Wort „Cookie“ auch ähnliche Einträge wie den lokalen Speicher des Browsers.',
          ],
        },
        {
          heading: 'Notwendige Einträge',
          paragraphs: ['Diese Einträge sind für den Betrieb der Website nötig und erfordern keine Einwilligung.'],
          bullets: [
            'Spracheinstellung: merkt sich, in welcher Sprache Sie die Website ansehen',
            'Cookie-Einstellung: merkt sich Ihre Entscheidung zur Analyse',
            'Verwaltungssitzung: entsteht nur bei Büromitarbeitern, die sich im Verwaltungsbereich anmelden',
          ],
        },
        {
          heading: 'Analyse-Cookies',
          paragraphs: [
            'Mit Ihrer Einwilligung läuft Google Analytics 4. Ohne Einwilligung wird kein Analyse-Cookie gesetzt und nichts gemessen.',
            'Mit Google Analytics 4 messen wir nur Folgendes. Name, Telefonnummer und Nachricht aus den Formularen werden nicht an das Analysewerkzeug gesendet.',
          ],
          bullets: [
            'Seitenaufrufe',
            'Klicks auf die WhatsApp-Schaltfläche',
            'Klicks auf die Telefon-Schaltfläche',
            'Klicks zum Absenden von Formularen',
          ],
        },
        {
          heading: 'Ihre Wahl ändern',
          paragraphs: [
            'Ihre Entscheidung können Sie jederzeit über den Link „Cookie-Einstellungen“ unten auf jeder Seite ändern. Außerdem können Sie gespeicherte Cookies in den Einstellungen Ihres Browsers löschen.',
          ],
        },
        {
          heading: 'Inhalte Dritter',
          paragraphs: [
            'Die Inseratskarten verwenden Kartenkacheln von OpenStreetMap. Wenn Sie die Karte öffnen, ruft Ihr Browser die Kacheln von den Servern von OpenStreetMap ab, und dabei wird Ihre IP-Adresse an diese Server übermittelt.',
            'Die Schriftarten der Website werden über Google Fonts geladen; Ihr Browser ruft die Schriftdateien von Google-Servern ab. Auf der Website gibt es keine Werbung und keine Werbe-Cookies.',
          ],
        },
      ],
      banner: {
        text: 'Wir möchten Google Analytics nutzen, um zu messen, wie Sie die Website verwenden. Ohne Ihre Einwilligung wird kein Analyse-Cookie gesetzt.',
        accept: 'Akzeptieren',
        reject: 'Ablehnen',
        settings: 'Cookie-Einstellungen',
        analyticsLabel: 'Analyse',
        analyticsHelp: 'Misst mit Google Analytics 4 Seitenaufrufe sowie Klicks auf WhatsApp, Telefon und Formulare.',
        necessaryLabel: 'Notwendig',
        necessaryHelp: 'Spracheinstellung, Cookie-Einstellung und Verwaltungssitzung. Kann nicht deaktiviert werden.',
        save: 'Auswahl speichern',
      },
    },
  },
};
