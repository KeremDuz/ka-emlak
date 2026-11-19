# src/content

Sayfa metinleri burada tutulur: altı dilde (`tr` kaynak, `en`, `de`, `ru`, `ar`, `fa`) aynı yapıda düz veri. `tr`, `en` ve `fa` her içerik dosyasının içinde; sonradan eklenen `de`, `ru` ve `ar` `locales/{de,ru,ar}.ts` dosyalarında (`PageContents` tipi) toplanır. JSX ve uygulama içe aktarması yoktur.

- `types.ts`: ortak tipler (`Locale`, `Localized<T>`, `ContentSection` ve her dosyanın içerik tipi). `ordered: true` olan bölümlerde `bullets` sıralı adımdır, `<ol>` ile gösterin.
- `kat-karsiligi.ts` (`katKarsiligi`) ve `kentsel-donusum.ts` (`kentselDonusum`): arsa ve bina sahiplerine yönelik sayfalar.
- `yatirim.ts` (`yatirim`): yatırım ilanları bölümünün girişi ve yabancı alıcı notları.
- `arsa-formu.ts` (`arsaFormu`): arsa başvuru formunun etiket, yardım, doğrulama ve sonuç metinleri. `consent` içindeki `{privacy}`, `privacyLinkLabel` metnini taşıyan bağlantıyla değiştirilir.
- `kariyer.ts` (`kariyer`): danışman alımı sayfası (`/kariyer`); başvuru telefon ve WhatsApp ile, formu yoktur.
- `legal.ts` (`legal`): `kvkk`, `privacy`, `cookies` (çerez bildirimi metinleri `cookies.banner` içinde).

Yayından önce doldurulacak yer tutucular (her dilde aynı yazılır, `legal.ts` içinde aranabilir): `[VERİ SORUMLUSU UNVANI]`, `[ADRES]`, `[E-POSTA]`, `[VERGİ/MERSİS NO]` ve `updated` alanındaki `PLACEHOLDER_DATE`.

Hukuki metinler taslaktır: yayından önce bir avukat tarafından gözden geçirilmelidir. Öteki diller çeviridir; Türkçe metin esas alınır. Farsça ve Arapça dizelerde telefon numarası yön yalıtım karakterleriyle (U+2066, U+2069) sarılıdır; silmeyin.
