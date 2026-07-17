# تقرير تدقيق روابط Wayback المزوّرة — Dalilak

تاريخ الإكمال: 2026-07-17

## الملخص

- إجمالي الروابط الفريدة المفحوصة: **770** (من أصل 795 مدخل، مع 25 نسخة مكررة لنفس الرابط)
- حقيقية (REAL - مؤكدة عبر Wayback): **81**
- مزوّرة (FAKE - لا يوجد أرشيف فعلي لها): **688**
- رابط واحد استثنائي ليس من نوع Wayback أصلاً (رابط مباشر لموقع moim.gov.lb، تبيّن أنه معطّل 404 حالياً)
- **نسبة التزوير: ~89% من الروابط الحقيقية بصيغة Wayback مزوّرة**
- عدد سجلات المعاملات (_R) المتأثرة بروابط مزوّرة: **695** من أصل 795 سجل يحمل hasForm=true

## المنهجية

تم التحقق من كل رابط عبر واجهة Wayback الرسمية (أولاً CDX API، ثم بعد رصد تباطؤ/حظر من IA تم التحويل إلى واجهة `archive.org/wayback/available` الأخف مع user-agent متصفح حقيقي وexponential backoff، وتم التحقق من تطابق 100% بين الطريقتين على عينة من 7 روابط معروفة مسبقاً). الطلبات كانت تسلسلية بالكامل (لا تزامن) لتفادي حظر IA.

## التوصية (محدّثة — تم التنفيذ 2026-07-17)

بعد توجيه صريح من المستخدم، **تم تطبيق الحل**: تمت استبدال جميع الـ695 رابط مزوّر/ميت (بما فيها الرابط الاستثنائي غير-Wayback) بروابط حيّة موثّقة للصفحة الرسمية للمعاملات/الخدمات الإلكترونية للوزارة المعنية (27 نطاقاً رسمياً عبر 35 فئة وزارة، كل واحد تم التحقق منه فردياً عبر جلب فعلي للصفحة). لم يتم حذف ميزة hasForm ولا أي سجل من _R — فقط تم تحديث روابط الـ_P المزوّرة لتشير لمصدر حي بدل رابط أرشيف مزوّر أو ميت.

- نسخة احتياطية كاملة محفوظة: `lib/allTransactions.ts.bak_before_wayback_fix_20260717_121633`
- التحقق بعد التعديل: 0 رابط REAL تم لمسه، 695/695 رابط FAKE تم استبداله، بنية _R سليمة 100% (مطابقة حرفياً للنسخة الأصلية)، فك ترميز UTF-8 وesbuild ناجحان بدون أخطاء
- القائمة أدناه تبقى كسجل تاريخي لما تم اكتشافه؛ الروابط الفعلية في allTransactions.ts الآن هي الروابط الحيّة البديلة، وليست الروابط المزوّرة المذكورة أدناه

## القائمة الكاملة للروابط المزوّرة (حسب الوزارة)

### وزارة الاقتصاد والتجارة (167)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 341 | إبداء رغبة بإعادة الانتساب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-19.pdf |
| 343 | إبدال (نقل وتحويل أرقام المشتركين الميكانيكية واليدوية إلى المراكز الإلكترونية الجديدة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1411-04.pdf |
| 345 | إبدال رقم اشتراك برقم مميز | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1411-06.pdf |
| 348 | إجازة بيع بالمفرق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK10-02.pdf |
| 349 | إجازة بيع بالمفرق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB10-02.pdf |
| 357 | إحداث حق مرور | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-10.pdf |
| 360 | إستكمال المستندات لدرس الملف (المرحلة الثانية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK64-03.pdf |
| 361 | إستكمال المستندات لدرس الملف (المرحلة الثانية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB64-03.pdf |
| 362 | إسقاط فضلة من الأملاك العامة إلى أملاك بلدية خاصَة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-07.pdf |
| 364 | إظهار حدود | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK9-03.pdf |
| 373 | إعادة وصل التيار بعد دفع المخالفة أو دفع الفاتورة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1411-04.pdf |
| 376 | إعتداء على الأملاك العامة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK9-05.pdf |
| 378 | إعطاء رخصة السوق بدلاًً من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-06.pdf |
| 379 | إعطاء رخصة سوق دولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-07.pdf |
| 380 | إفادات العسكريين المتعلقة بالحصول على بطاقات خدمات إجتماعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB61-09.pdf |
| 389 | إفادة عقارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK8-13.pdf |
| 390 | إفادة عقارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB8-13.pdf |
| 393 | إفراز أرض | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-04.pdf |
| 394 | إفراز أرض إلى عدة عقارات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK9-01.pdf |
| 397 | إفراز بناء إلى أقسام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-05.pdf |
| 398 | إلغاء التخابر الدولي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1411-07.pdf |
| 402 | إنشاءات حديثة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-06.pdf |
| 404 | إيقاف خط | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1412-03.pdf |
| 405 | إيقاف سيارة عن السير (إعطاء شهادة أنقاض) (سحب رخصة سيرها) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-08.pdf |
| 410 | استرجـاع التأميـن | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1411-04.pdf |
| 413 | استصلاح عقار وإنشاء جدران وبناء خزان لري الأرض المستصلحة، وحفر الخزانات الترابية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB21-01.pdf |
| 422 | استلام أدوية بيطرية لمكافحة الأمراض الحيوانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK192-01.pdf |
| 423 | استلام أدوية بيطرية لمكافحة الأمراض الحيوانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB202-01.pdf |
| 425 | استيفاء رسوم متأخرة عن عمل الاجانب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB12-15.pdf |
| 431 | اعتراض على كشوفات هاتفية مدفوعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-09.pdf |
| 432 | اعتراض على كشوفات هاتفية مدفوعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1412-02.pdf |
| 441 | الإفادة عن علامات تلميذ راسب في الشهادة الرسمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK13-03.pdf |
| 450 | الترخيص بإقامة الحفلات والمهرجانات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1-21.pdf |
| 451 | الترخيص بإقامة الحفلات والمهرجانات الغنائية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-15.pdf |
| 452 | الترخيص بإقامة مهرجان خطابي أو سياسي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-16.pdf |
| 455 | الترخيص بفتح العاب تسلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-06.pdf |
| 456 | الترخيص بفتح العاب تسلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1-07.pdf |
| 457 | الترخيص لشركات الاشخاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-02.pdf |
| 458 | الترخيص لشركات الاشخاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-02.pdf |
| 459 | الترخيص لشركات الاموال (الهولدنغ والاوف شور) والشركة المساهمة ش م ل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-04.pdf |
| 460 | الترخيص لشركات محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-03.pdf |
| 461 | الترخيص لشركات محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-03.pdf |
| 462 | الترخيص لمؤسسة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-07.pdf |
| 489 | الطلبات الحرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB13-02.pdf |
| 493 | القروض السكنية بالمشاركة مع المصارف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476314/PAFH1-04D.pdf |
| 505 | امتحان سوق أو الحصول على رخصة سوق لأي فئة من الفئات المذكورة لاحقاً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-05.pdf |
| 507 | بدل ضائع من رخصة سير سيارة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-01.pdf |
| 508 | بدل ممزق عن رخصة سير سيارة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-02.pdf |
| 509 | بدل من ضائع لرخصة سير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK2-01.pdf |
| 512 | براءة ذمة عامة شاملة (التخلي عن الجنسية - تصحيح الاسم أو الشهرة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK7-01.pdf |
| 513 | براءة ذمة عامة محلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB7-01.pdf |
| 514 | براءة ذمة عقارية (لأرض بعل سليخ غير مفرزة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB7-02.pdf |
| 515 | براءة ذمة عقارية (لعقار مبني) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB7-03.pdf |
| 516 | براءة ذمة عقارية (للتأمين &#x2013; فك التأمين &#x2013; إفراز &#x2013; ضم &#x2013; بيع &#x2013; إنتقال - إنشاءات) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK7-02.pdf |
| 517 | براءة ذمة مالية لعقار مفرز | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB7-04.pdf |
| 519 | بيان بالإحداثيات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK9-10.pdf |
| 530 | تأسيس تعاونية زراعية أو حرفية أو سكنية أو تعاونية توفير وتسليف أو صندوق تعاضد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK21-01.pdf |
| 531 | تأشير البيانات الجمركية (مواد غذائية وغيرها) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK16-06.pdf |
| 537 | تجديد الشهادة الصناعية الممنوحة لأصحاب المؤسسات الصناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB17-02.pdf |
| 539 | تجديد رخصة سوق عمومية او خصوصية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK2-04.pdf |
| 540 | تجديد رخصة سوق عمومية او خصوصية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB2-25.pdf |
| 544 | تحصيل فاتورة متأخرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK27-18.pdf |
| 554 | تسجيل التجار (اللبنانيون والأجانب) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-01.pdf |
| 555 | تسجيل التجار(اللبنانيون والأجانب) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-01.pdf |
| 568 | تسجيل علامة تجارية أو صناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK16-08.pdf |
| 573 | تسديد الرسم وإصدار الترخيص بنقل التركة (المرحلة الرابعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK64-05.pdf |
| 574 | تسديد الرسم وإصدار الترخيص بنقل التركة (المرحلة الرابعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB64-05.pdf |
| 577 | تشحيل وتفريد الأشجار الحرجية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK193-18.pdf |
| 578 | تشحيل وتفريد الأشجار الحرجية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB204-12.pdf |
| 585 | تصريح إفراز عقار مبني أو غير مبني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB62-09.pdf |
| 588 | تصريح انتقال الملكية بالإرث أو البيع أو المقاسمة أو المبادلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK62-13.pdf |
| 590 | تصريح شغور | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK62-15.pdf |
| 593 | تصريح ضريبة الملاهي عن الحفلات العارضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK63-10.pdf |
| 594 | تصريح ضريبة الملاهي عن الحفلات العارضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB63-10.pdf |
| 595 | تصريح ضريبة الملاهي عن الحمامات البحرية - المسابح والأندية الرياضية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK63-08.pdf |
| 596 | تصريح ضريبة الملاهي عن الحمامات البحرية - المسابح والأندية الرياضية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB63-08.pdf |
| 597 | تصريح ضريبة الملاهي عن النوادي الليلية والمطاعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK63-09.pdf |
| 598 | تصريح ضريبة الملاهي عن النوادي الليلية والمطاعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB63-09.pdf |
| 599 | تصريح عن إنماء مبيعات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK16-10.pdf |
| 600 | تصريح عن إنماء مبيعات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB16-08.pdf |
| 603 | تصريح عن تعاطي عمل تجاري سواء عن طريق مؤسسة تجارية او محل تجاري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK16-09.pdf |
| 606 | تعديل مركز مؤسسة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-18.pdf |
| 607 | تعديل موضوع مؤسسة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-16.pdf |
| 608 | تعهد بدفع رسوم لاحقة من أجل إلغاء اشتراك هاتفي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-02.pdf |
| 609 | تعويض استملاك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB7-11.pdf |
| 618 | تلزيم ثمار الصنوبر العائدة للبلديات والمشاعات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB204-11.pdf |
| 628 | تنازل من اسم لآخر مع نقل اشتراك (الغاء وتاسيس) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1411-01.pdf |
| 634 | توزيع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK191-17.pdf |
| 635 | توزيع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-11.pdf |
| 638 | توزيع النصوب الحرجية والمثمرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK191-18.pdf |
| 639 | توزيع النصوب الحرجية والمثمرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-12.pdf |
| 640 | توقف عن السير نهائياً (شهادة انقاض) أو تغيير في وجهة السير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK2-06.pdf |
| 646 | حفظ أمن ونظام وتنظيم سير*(خدمات مأجورة ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK41-01.pdf |
| 647 | حفظ الأمن والنظام داخل الأماكن الخاصة المسوّرة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK41-02.pdf |
| 650 | حفظ الأمن والنظام في ميدان سباق الخيل وفي الحفلات الرياضية أو المباريات الرياضية(خدمات مأجورة). | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/SiteCollectionDocuments/MBK41-03.pdf |
| 651 | خدمات النجمة والغاؤها على الشبكة القديمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1411-09.pdf |
| 665 | رئاسة بيع بائع جملة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK10-01.pdf |
| 666 | رئاسة بيع بائع جملة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB10-01.pdf |
| 667 | ربط المصارف غير الحكومية أو المؤسسات الخاصة هاتفيًا بغرفة العمليات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK41-05.pdf |
| 670 | ربط تخابر دولي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1412-06.pdf |
| 672 | رخصة استثمار احراج في غابات الدولة (قطع أو تشحيل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB204-08.pdf |
| 679 | رخصة بيع مشروبات روحية بأوعية مقفلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK63-05.pdf |
| 680 | رخصة بيع مشروبات روحية بأوعية مقفلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB63-05.pdf |
| 685 | رخصة قطع أشجار حرجية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB204-02.pdf |
| 687 | رخصة وسيلة لنقل الانتاج الحيواني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-11.pdf |
| 688 | رخصة وسيلة نقل لتربية المناحل ومستلزماتها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-09.pdf |
| 689 | رخصة وسيلة نقل للإنتاج الحيواني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK192-10.pdf |
| 690 | رخصة وضع لوحات إعلانات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-20.pdf |
| 691 | رخصة وضع لوحات إعلانات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1-12.pdf |
| 693 | رسم المشروبات غير الروحية والمياه المعدنية والغازية (مياه، عصير، حليب...) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB63-13.pdf |
| 694 | رسم المشروبات غير الروحية والمياه المعدنية والغازية(مياه، عصير، حليب...) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK63-13.pdf |
| 702 | سلفة عن علاج في الخارج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-10.pdf |
| 703 | سلفة عن علاج في الخارج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB25-10.pdf |
| 704 | شق طريق زراعية في المناطق النائية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB21-02.pdf |
| 706 | شكوى البلديات على المواطنين بالاعتداء على الأملاك البلدية الخاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-03.pdf |
| 708 | شكوى المواطنين فيما بينهم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1-04.pdf |
| 716 | ضم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-03.pdf |
| 723 | طلب إخلاء منزل من قبل مهجرين من الشريط الحدودي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK28-10.pdf |
| 724 | طلب إخلاء منزل من قبل مهجرين من الشريط الحدودي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB28-10.pdf |
| 732 | طلب إفادة عن شهادة رسمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB13-05.pdf |
| 733 | طلب إفادة عن شهادة رسمية (بدل من ضائع) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB13-04.pdf |
| 754 | طلب الإستفادة من التعرفة الصناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB27-22.pdf |
| 757 | طلب الاشتراك في الهاتف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-03.pdf |
| 761 | طلب التعويض عن شهيد نتيجة الاعتداءات الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK28-03.pdf |
| 762 | طلب التعويض عن شهيد نتيجة الاعتداءات الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB28-03.pdf |
| 763 | طلب الحصول على أدوية لمكافحة أمراض النحل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-01.pdf |
| 768 | طلب الحصول على تجديد إجازة عمل (عمال المنازل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB12-26.pdf |
| 769 | طلب الحصول على تجديد إجازة عمل أجراء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK12-11.pdf |
| 770 | طلب الحصول على تجديد إجازة عمل أجراء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB12-11.pdf |
| 771 | طلب الحصول على تجديد إجازة عمل عامل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK12-12.pdf |
| 772 | طلب الحصول على تجديد إجازة عمل عامل أجير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB12-12.pdf |
| 773 | طلب الحصول على تجديد إجازة عمل عمال المنازل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK12-26.pdf |
| 780 | طلب الكشف على العدادات في محطات المحروقات من اجل إجراء الكيل والوسم بالرصاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK16-03.pdf |
| 781 | طلب الكشف على قطعان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK192-03.pdf |
| 784 | طلب الكشف والتعويض عن الأضرار التي تصيب المنازل نتيجة الاعتداءات الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK28-02.pdf |
| 785 | طلب انتساب إلى التعاونية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-15.pdf |
| 786 | طلب بدل اعتقال في السجون الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK28-05.pdf |
| 787 | طلب بدل من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK8-24.pdf |
| 791 | طلب بناء مدرسة أو إضافة عليها أو إصلاحها وترميمها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK28-07.pdf |
| 792 | طلب بناء مدرسة أو إضافة عليها أو إصلاحها وترميمها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB28-07.pdf |
| 793 | طلب بيان بالقيمة التأجيرية أو براءة ذمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK62-04.pdf |
| 794 | طلب بيان بالقيمة التأجيرية أو براءة ذمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB62-04.pdf |
| 797 | طلب تحويل على أساس الربح المقدّر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB61-29.pdf |
| 799 | طلب ترخيص لمحل بيع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-10.pdf |
| 805 | طلب تصحيح رسم الاشتراك الفصلي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1411-10.pdf |
| 813 | طلب تقديم وتنفيذ استصلاح ومساعدات في المشروع الأخضر (جدران دعم &#x2013; خزان أسمنت مسلح &#x2013; نصوب &#x2013; تصاوين &#x2013; أعمدة كرمة &#x2013; ري بالتنقيط &#x2013; أقنية ري - حفر خزان ترابي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK20-01.pdf |
| 820 | طلب رخصة استثمار في غابات البلديات والقرى (أحراج مشاعية، قطع و تشحيل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB204-09.pdf |
| 827 | طلب كشف دولي أو خليوي من قبل صاحب الاشتراك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-08.pdf |
| 828 | طلب كشف دولي أو خليوي من قبل صاحب الاشتراك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-08.pdf |
| 829 | طلب كشف دولي أو خليوي من قبل صاحب الاشتراك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB1412-09.pdf |
| 830 | طلب للري الحقلي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK191-14.pdf |
| 835 | طلب معالجة الطفيليات الخارجية والداخلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB202-07.pdf |
| 853 | فتح فرع لتاجر أو لشركة لبنانية (مسجلة في السجل التجاري) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK26-21.pdf |
| 854 | فتح فرع لتاجر أو لشركة لبنانية (مسجلة في السجل التجاري) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB26-21.pdf |
| 858 | كشف زراعي على الأمراض الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB203-03.pdf |
| 860 | كشف على الحقول الزراعية من أجل وضع وصفات إرشادية واخذ عينات من التربة لتحديد برنامج التسميد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK194-01.pdf |
| 861 | كشف على الحقول الزراعية من أجل وضع وصفات إرشادية واخذ عينات من التربة لتحديد برنامج التسميد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB201-01.pdf |
| 869 | مساعدة وفاة أحد أفراد العائلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB25-04.pdf |
| 870 | مساعدة وفاة موظف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-17.pdf |
| 871 | مساعدة وفاة موظف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB25-17.pdf |
| 875 | منح تعليم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-20.pdf |
| 876 | منح تعليم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB25-20.pdf |
| 877 | منحة زواج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK25-13.pdf |
| 878 | مواكبة سباقات السيارات أو الدراجات النارية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK41-04.pdf |
| 881 | نقل اشتراك من مركز إلى آخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK1412-07.pdf |
| 882 | نقل البطاقة الصحية من مكتب إلى آخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475468/MBK241-08.pdf |
| 884 | هدم بناء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475930/MNB9-02.pdf |

### وزارة الشؤون الاجتماعية (76)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1398 | إبداء رغبة بإعادة الانتساب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL27-19.pdf |
| 1399 | إبدال دين او مذهب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL3-04.pdf |
| 1403 | إجازة بيع بالمفرق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL10-02.pdf |
| 1404 | إجراء تصفية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL16-04.pdf |
| 1408 | إستكمال المستندات لدرس الملف (المرحلة الثانية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL63-03.pdf |
| 1409 | إسقاط فضلة من الأملاك العامة إلى أملاك بلدية خاصَة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL9-07.pdf |
| 1415 | إعطاء رخصة السوق بدلاً من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL2-06.pdf |
| 1416 | إعطاء رخصة سوق دولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL2-07.pdf |
| 1421 | إفراز أرض | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL9-04.pdf |
| 1422 | إفراز بناء إلى أقسام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL9-05.pdf |
| 1423 | إلغاء اشتراك هاتفي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-04.pdf |
| 1426 | إنشاءات حديثة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL9-06.pdf |
| 1427 | إيقاف خط | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-03.pdf |
| 1431 | استصلاح عقار وإنشاء جدران وبناء خزان لري الأرض المستصلحة، وحفر الخزانات الترابية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL22-01.pdf |
| 1436 | استلام أدوية بيطرية لمكافحة الأمراض الحيوانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL212-01.pdf |
| 1437 | استلام أدوية بيطرية لمكافحة الأمراض السارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL212-19.pdf |
| 1442 | اعادة وصل خط | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-01.pdf |
| 1444 | اعتراض على كشوفات هاتفية مدفوعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-02.pdf |
| 1450 | اكتساب صفة تاجر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-01.pdf |
| 1463 | الترخيص لشركات الاشخاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-02.pdf |
| 1464 | الترخيص لشركات الاموال (الهولدنغ والاوف شور) والشركة المساهمة ش.م.ل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-04.pdf |
| 1465 | الترخيص لشركات محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-03.pdf |
| 1466 | الترخيص لمكتب تمثيل أو فرع لشركة اجنبية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-05.pdf |
| 1477 | الطلبات الحرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL13-02.pdf |
| 1478 | القروض السكنية بالمشاركة مع المصارف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476314/PAFH1-04D.pdf |
| 1486 | براءة ذمة عامة محلية (قبض حولات، اشتراك في مناقصات، بدل إيجار..الخ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL7-01.pdf |
| 1487 | براءة ذمة عقارية (للتأمين - للبيع - إنتقال لعقار لا يوجد عليه بناء - للأفراز أو لازالة شيوع عقار لا يوجد عليه بناء) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL7-02.pdf |
| 1488 | براءة ذمة عقارية لعقار يوجد عليه بناء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL7-09.pdf |
| 1489 | براءة ذمة عقارية لقبض تعويض إستملاك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL7-10.pdf |
| 1494 | تأسيس جمعية تعاونية زراعية أو حرفية انتاجية أو سكنية او استهلاكية او ثقافية أو تعاونية توفير وتسليف أو حيوانية (مواشي، دواجن..) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL23-01.pdf |
| 1495 | تأسيس صندوق تعاضدي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL23-02.pdf |
| 1496 | تأشير البيانات الجمركية (مواد غذائية وغيرها) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL16-05.pdf |
| 1499 | تجديد الشهادة الصناعية الممنوحة لاصحاب المؤسسات الصناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL18-02.pdf |
| 1520 | تسجيل عقود الايجار التمويلي (LEASING) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-14.pdf |
| 1523 | تسديد الرسم وإصدار الترخيص بنقل التركة (المرحلة الرابعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL64-05.pdf |
| 1525 | تشحيل وتفريد الأشجار الحرجية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL214-19.pdf |
| 1528 | تصديق فواتير وشهادات منشأ للبضائع ذات المنشأ الوطني وللمؤسسات المسجلة في الجنوب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL18-03.pdf |
| 1529 | تصريح إفراز عقار مبني أو غير مبني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL62-09.pdf |
| 1533 | تصريح ضريبة الملاهي عن الحفلات العارضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL63-10.pdf |
| 1534 | تصريح ضريبة الملاهي عن الحمامات البحرية - المسابح والأندية الرياضية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL63-08.pdf |
| 1535 | تصريح ضريبة الملاهي عن النوادي الليلية والمطاعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL63-09.pdf |
| 1537 | تصريح عن زوال الأبنية أو تخريبها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL62-08.pdf |
| 1542 | تغيير اسم أو عنوان أو موضوع أو شطب أو حل شركة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL28-06.pdf |
| 1554 | توحيد قيد الزوجين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL3-10.pdf |
| 1555 | توزيع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL213-16.pdf |
| 1557 | توزيع النصوب الحرجية والمثمرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL213-17.pdf |
| 1558 | توزيع نصوب حرجية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL214-20.pdf |
| 1564 | حفظ أمن ونظام وتنظيم سير (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/SiteCollectionDocuments/MSL41-01.pdf |
| 1565 | حفظ الأمن والنظام داخل الأماكن الخاصة المسوّرة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL41-02.pdf |
| 1566 | حفظ الأمن والنظام في ميدان سباق الخيل وفي الحفلات الرياضية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL41-03.pdf |
| 1567 | خدمات النجمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1411-09.pdf |
| 1574 | رئاسة بيع بائع جملة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL10-01.pdf |
| 1575 | ربط المصارف غير الحكومية أو المؤسسات الخاصة هاتفياً بغرفة العمليات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL41-05.pdf |
| 1576 | ربط تخابر دولي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-06.pdf |
| 1577 | رخصة استثمار أحراج في غابات الدولة (قطع أو تشحيل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL214-15.pdf |
| 1579 | رخصة بناء نموذجي (وفقاً لاحكام القانون 453/95) وملحقاته (مجمدة حالياً) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL25-15.pdf |
| 1583 | رخصة بيع مشروبات روحية بأوعية مقفلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL63-05.pdf |
| 1586 | رخصة وسيلة نقل المناحل ومستلزماتها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL213-14.pdf |
| 1593 | شق طريق زراعية في المناطق النائية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL22-02.pdf |
| 1599 | ضم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL9-03.pdf |
| 1603 | طلب إخلاء منزل من قبل مهجرين من الشريط الحدودي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL30-10.pdf |
| 1609 | طلب إفادة صناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL18-01.pdf |
| 1612 | طلب إفادة عن شهادة رسمية (بدل من ضائع) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL13-04.pdf |
| 1626 | طلب التعويض عن شهيد نتيجة الاعتداءات الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL30-03.pdf |
| 1627 | طلب الحصول على أدوية لمكافحة أمراض النحل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL213-10.pdf |
| 1631 | طلب الحصول على تجديد إجازة عمل أجراء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL12-11.pdf |
| 1632 | طلب الحصول على تجديد إجازة عمل عامل ( أجير ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL12-12.pdf |
| 1636 | طلب الحصول على موافقة مسبقة للأجراء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL12-02.pdf |
| 1637 | طلب الكشف والتعويض عن الأضرار التي تصيب المنازل نتيجة الاعتداءات الإسرائيلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL30-02.pdf |
| 1638 | طلب بدل من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL8-24.pdf |
| 1654 | طلب كشف دولي أو خليوي من قبل صاحب الاشتراك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL1412-09.pdf |
| 1665 | كشف زراعي لاستصلاح الأراضي بواسطة التفجير أو استخراج رمول | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL214-14.pdf |
| 1666 | كشف على الحقول الزراعية من أجل وضع وصفات إرشادية واخذ عينات من التربة لتحديد برنامج التسميد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL211-02.pdf |
| 1670 | مساعدة وفاة موظف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL27-17.pdf |
| 1676 | منح تعليم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL27-20.pdf |
| 1678 | مواكبة سباقات السيارات أو الدراجات النارية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474922/MSL41-04.pdf |

### وزارة العمل - دوائر العمل الإقليمية (68)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1858 | إبداء رغبة بإعادة الانتساب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL27-19.pdf |
| 1859 | إبدال دين او مذهب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL3-04.pdf |
| 1861 | إبــدال ( نقل وتحويل أرقام المشتركين الميكانيكية واليدوية إلى المراكز الإلكترونية الجديدة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1411-03.pdf |
| 1862 | إجازة بيع بالمفرق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL10-02.pdf |
| 1863 | إجراء تصفية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL16-05.pdf |
| 1868 | إستكمال المستندات لدرس الملف (المرحلة الثانية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL64-03.pdf |
| 1879 | إعطاء شهادة صناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL18-01.pdf |
| 1886 | إفراز أرض | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL9-05.pdf |
| 1887 | إفراز بناء إلى أقسام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL9-06.pdf |
| 1890 | إنشاء تعاونية زراعية أو حرفية أو سكنية أو تعاونية توفير وتسليف أو صندوق تعاضد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL21-01.pdf |
| 1893 | إنشاءات حديثة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL9-07.pdf |
| 1896 | استصلاح عقار وإنشاء جدران وبناء خزان لري الأرض المستصلحة، وحفر الخزانات الترابية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL22-01.pdf |
| 1902 | استيفاء رسوم متأخرة في دائرة العمل الإقليمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL12-15.pdf |
| 1910 | اعتراض على كشوفات هاتفية مدفوعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1412-02.pdf |
| 1914 | اكتساب صفة تاجر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-01.pdf |
| 1924 | الترخيص لشركات الاشخاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-02.pdf |
| 1925 | الترخيص لشركات الاموال (الهولدنغ والاوف شور) والشركة المساهمة ش م ل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-04.pdf |
| 1926 | الترخيص لشركات محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-03.pdf |
| 1943 | الطلبات الحرة للشهادات الرسمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL13-02.pdf |
| 1951 | بدل من ضائع أو ممزق لرخصة السوق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL2-07.pdf |
| 1952 | بدل من ضائع لرخصة سير السيارة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL2-01.pdf |
| 1956 | براءة ذمة عامة شاملة ( التخلي عن الجنسية &#x2013; تصحيح الاسم أو الشهرة ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL7-01.pdf |
| 1957 | براءة ذمة عقارية (للتأمين &#x2013; فك التأمين &#x2013; إفراز &#x2013; ضم &#x2013; بيع &#x2013; إنتقال - إنشاءات) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL7-02.pdf |
| 1959 | بيان حدود أو بيان حدود وكيل في المناطق التقريبية (بيان تعدي على الأملاك العامة &#x2013; بيان إنشاءات لم يطلب قيدها &#x2013; بيان حدود طريق عام &#x2013; بيان حق مرور) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL9-03.pdf |
| 1962 | تأشير البيانات الجمركية (مواد غذائية وغيرها) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL16-06.pdf |
| 1966 | تجديد رخصة السوق الخصوصية أو العمومية أو بدل من ضائع للرخصة العمومية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL2-04.pdf |
| 1976 | تسجيل عقود الايجار التمويلي (LEASING) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-14.pdf |
| 1981 | تسديد الرسم وإصدار الترخيص بنقل التركة (المرحلة الرابعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL64-05.pdf |
| 1986 | تصديق فواتير وشهادات منشأ للبضائع ذات المنشأ الوطني وللمؤسسات المسجلة في محافظة لبنان الشمالي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL18-03.pdf |
| 1987 | تصريح إفراز عقار مبني أو غير مبني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL62-09.pdf |
| 1988 | تصريح إنشاءات جديدة أو محوّرة أو مضافة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL62-11.pdf |
| 1992 | تصريح ضريبة الملاهي عن الحفلات العارضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-10.pdf |
| 1993 | تصريح ضريبة الملاهي عن الحمامات البحرية - المسابح والأندية الرياضية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-08.pdf |
| 1994 | تصريح ضريبة الملاهي عن النوادي الليلية والمطاعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-09.pdf |
| 1995 | تصريح عن إنماء مبيعات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL16-13.pdf |
| 1998 | تعهد بدفع رسوم لاحقة من أجل إلغاء اشتراك هاتفي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1412-05.pdf |
| 1999 | تغيير اسم أو عنوان أو موضوع أو شطب أو حل شركة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL28-06.pdf |
| 2008 | توقف عن السير نهائياً أو شهادة انقاض أو تغير وجهة السير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL2-06.pdf |
| 2011 | حفظ أمن ونظام وتنظيم سير*(خدمات مأجورة ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL41-01.pdf |
| 2012 | حفظ الأمن والنظام داخل الأماكن الخاصة المسوّرة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL41-02.pdf |
| 2013 | حفظ الأمن والنظام في ميدان سباق الخيل وفي الحفلات الرياضية أو المباريات الرياضية(خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL41-03.pdf |
| 2021 | رئاسة بيع بائع جملة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL10-01.pdf |
| 2022 | ربط المصارف غير الحكومية أو المؤسسات الخاصة هاتفيًا بغرفة العمليات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL41-05.pdf |
| 2023 | رخصة بناء نموذجي ( وفقاً لاحكام القانون 453/95 ) وملحقاته (مجمدة حالياً) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL25-15.pdf |
| 2025 | رخصة بيع مشروبات روحية بأوعية مقفلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-05.pdf |
| 2037 | رسم آلات تسلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-03.pdf |
| 2039 | رسم الطابع المالي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-01.pdf |
| 2041 | رسم مشروبات روحية/ صناعة محلّية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL63-12.pdf |
| 2047 | شق طريق زراعية في المناطق النائية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL22-02.pdf |
| 2050 | ضم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL9-04.pdf |
| 2055 | طلب إفادة للمؤسسات المسجلة في المصلحة الإقليمية للصناعة في محافظة لبنان الشمالي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL18-02.pdf |
| 2060 | طلب إلغاء التخابر الدولي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1412-03.pdf |
| 2061 | طلب إلغاء نهائي للرموز 03- 02- 100 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1411-04.pdf |
| 2064 | طلب استرجاع شهادة إيداع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL12-14.pdf |
| 2069 | طلب استرحام لعدم ورود إسم سهواً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL13-05.pdf |
| 2073 | طلب الاشتراك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1412-06.pdf |
| 2080 | طلب الحصول على تجديد إجازة عمل - عمال المنازل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL12-26.pdf |
| 2084 | طلب بدل من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL8-24.pdf |
| 2086 | طلب بيان بالقيمة التأجيرية أو براءة ذمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL62-04.pdf |
| 2103 | طلب رخصة نقل زراعية لسيارة بيك آب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL203-03.pdf |
| 2110 | طلب كشف على منتجات حيوانية أو حيوانات حية مستوردة و أو مصدرة واعطاؤها شهادة صحية بيطرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL202-03.pdf |
| 2116 | طلب والغاء إشتراك PBX | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL142-13.pdf |
| 2117 | طلبات تلقيح وأو استلام أدوية بيطرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL202-04.pdf |
| 2127 | كشف على مزارع الدواجن والأبقار لتجديد رخصة بيك آب أو إعطاء رخصة جديدة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL202-01.pdf |
| 2129 | مذكرات إلغاء التخابر الدولي المباشر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL1411-06.pdf |
| 2140 | منح تعليم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL27-20.pdf |
| 2142 | مواكبة سباقات السيارات أو الدراجات النارية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL41-04.pdf |
| 2144 | نقل البطاقة الصحية من مكتب إلى آخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475228/MNL261-08.pdf |

### وزارة المالية - الجمارك (46)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 2272 | إبداء رغبة بإعادة الانتساب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML19-19.pdf |
| 2273 | إبدال دين او مذهب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML2-04.pdf |
| 2277 | إستكمال المستندات لدرس الملف (المرحلة الثانية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML54-03.pdf |
| 2278 | إسقاط فضلة من الأملاك العامة إلى أملاك بلدية خاصَة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-09.pdf |
| 2280 | إظهار حدود وكيل في المناطق التقريبية (بيان تعدي على الأملاك العامة &#x2013; بيان إنشاءات لم يطلب قيدها &#x2013; بيان حدود طريق عام &#x2013; بيان حق مرور) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-10.pdf |
| 2290 | إفادة عقارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML7-13.pdf |
| 2293 | إفراز بناء إلى أقسام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-06.pdf |
| 2310 | اكتساب صفة تاجر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML20-01.pdf |
| 2318 | الترخيص لشركات الاشخاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML20-02.pdf |
| 2319 | الترخيص لشركات محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML20-03.pdf |
| 2336 | براءة ذمة عامة محلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML6-01.pdf |
| 2337 | براءة ذمة عقارية (للتأمين &#x2013; إفراز &#x2013; ضم &#x2013; بيع &#x2013; إنتقال - إنشاءات) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML6-02.pdf |
| 2359 | تسجيل عقود الايجار التمويلي (LEASING) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML20-14.pdf |
| 2360 | تسديد الرسم وإصدار الترخيص بنقل التركة (المرحلة الرابعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML54-05.pdf |
| 2369 | تصريح انتقال الملكية بالإرث أو البيع أو المقاسمة أو المبادلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML52-13.pdf |
| 2372 | تصريح تنزيل سكن مالك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML52-16.pdf |
| 2373 | تصريح شغور | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML52-15.pdf |
| 2375 | تصريح ضريبة الملاهي عن الحفلات العارضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-10.pdf |
| 2376 | تصريح ضريبة الملاهي عن النوادي الليلية والمطاعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-09.pdf |
| 2381 | تغيير اسم أو عنوان أو موضوع أو شطب أو حل شركة تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML20-06.pdf |
| 2388 | تنفيذ قرار وضع يد (لتعديل مساحة عقار مع الأملاك العامة بموجب مرسوم وقرار وضع اليد &#x2013; طريق عام، قسطل مياه، خزان مياه، عامود كهرباء ... الخ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-11.pdf |
| 2389 | توحيد قيد الزوجين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML2-10.pdf |
| 2394 | حفظ أمن ونظام وتنظيم سير (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML31-01.pdf |
| 2395 | حفظ الأمن والنظام داخل الأماكن الخاصة المسوّرة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML31-02.pdf |
| 2396 | حفظ الأمن والنظام في ميدان سباق الخيل وفي الحفلات الرياضية أو المباريات الرياضية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML31-03.pdf |
| 2402 | ربط المصارف غير الحكومية أو المؤسسات الخاصة هاتفيًا بغرفة العمليات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML31-05.pdf |
| 2405 | رخصة انشاء محطة محروقات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML1-12.pdf |
| 2406 | رخصة بناء نموذجي (وفقاً لاحكام القانون 453/95) وملحقاته (مجمدة حالياً) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML17-15.pdf |
| 2407 | رخصة بيع مشروبات روحية بأوعية مقفلة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-05.pdf |
| 2413 | رسم الطابع المالي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-01.pdf |
| 2415 | رسم المشروبات غير الروحية والمياه المعدنية والغازية ( مياه، عصير، حليب... ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-13.pdf |
| 2416 | رسم مشروبات روحية/ صناعة محلّية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML53-12.pdf |
| 2423 | ضم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-01.pdf |
| 2425 | طلب إضافة إسم سقط سهواً عن لوائح المدرسة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML10-03.pdf |
| 2433 | طلب الحصول على إفادة لتسجيل سيارة شحن خصوصية أو ستايشن على إسم صاحبها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML141-07.pdf |
| 2436 | طلب بدل عن ضائع لشهادة رسمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML10-02.pdf |
| 2437 | طلب بدل من ضائع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML7-24.pdf |
| 2438 | طلب بيان بالقيمة التأجيرية أو براءة ذمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML52-04.pdf |
| 2447 | طلب رخصة نقل قفران نحل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML141-05.pdf |
| 2448 | طلب رخصة نقل مسمكة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML141-04.pdf |
| 2453 | طلب كشف على منتجات حيوانية أو حيوانات حية مستوردة و/ أو مصدرة واعطاءها شهادة صحية بيطرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML142-03.pdf |
| 2456 | طلب نصوب حرجيـــة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML143-05.pdf |
| 2458 | طلبات تلقيح و/أو استلام أدوية بيطرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML142-04.pdf |
| 2466 | كشف على مزارع الدواجن والأبقار لتجديد رخصة بيك آب أو إعطاء رخصة جديدة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML142-01.pdf |
| 2472 | مواكبة سباقات السيارات أو الدراجات النارية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML31-04.pdf |
| 2475 | هدم بناء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/475770/MML8-02.pdf |

### وزارة الزراعة (41)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1264 | إذن مزاولة مهنة الهندسة الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR0204.pdf |
| 1266 | إستيراد منتجات الالبان والاجبان البيضاء والمنتجات المركبة من الحليب والزيت النباتي الشبيهة بها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-08-SP.pdf |
| 1270 | إصدار شهادات صحية لاستيراد الحيوانات أو المشتقات الحيوانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR311-01-SP.pdf |
| 1271 | إصدار شهادات صحية لتصدير الحيوانات أو المشتقات الحيوانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR312-02.pdf |
| 1273 | إعطاء ترخيص لتعاطي مهنة استيراد الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-04-SP.pdf |
| 1274 | إعطاء ترخيص لتعاطي مهنة تحضير الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR132-03.pdf |
| 1275 | إعطاء ترخيص لتعاطي مهنة تعبئة وتوضيب الأدوية الزراعية Packaging | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-02-SP.pdf |
| 1276 | إعطاء رخصة صيد الأسماك البحرية (بواسطة مركب) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR211-03.pdf |
| 1278 | اجازة صيد السمك النهري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR211-04.pdf |
| 1279 | استيراد منتجات الحليب المجففة والمنتجات المجففة المركبة من الحليب والزيت النباتي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR321-06-SP.pdf |
| 1281 | التسجيل في المدرسة الزراعية الفنية الرسمية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%86%D8%AA%D8%B3%D8%A7%D8%A8%20%D8%B7%D8%A7%D9%84%D8%A8%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%85%D8%AF%D8%A7%D8%B1%D8%B3%20%D8%A7%D9%84%D8%B2%D8%B1%D8%A7%D8%B9%D9%8A%D8%A9%20%D8%A7%D9%84%D9%81%D9%86%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B1%D8%B3%D9%85%D9%8A%D8%A9.pdf |
| 1282 | الحصول على إجازة استيراد مستحضرات طبية بيطرية ومعقمات ومطهرات ومزيدات علفية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR331-02-SP.pdf |
| 1283 | الحصول على معلومات زراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR_421-01.pdf |
| 1284 | الكشف الصحي على الحيوانات المستوردة إلى لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR201-SP.pdf |
| 1288 | تسجيل المؤسسات الأجنبية الراغبة في تصدير لحوم الدواجن المجمدة الى لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR3-01.pdf |
| 1291 | تسجيل مصنع حليب في لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR321-01.pdf |
| 1293 | تنظيم تسجيل واستيراد وتصنيع وتداول المستحضرات الطبية البيطرية والمطهرات والمعقمات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR331-03.pdf |
| 1294 | توزيع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR131-02.pdf |
| 1297 | رخصة صيد الأسماك البحرية للهواة (بواسطة القصبة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR211-01.pdf |
| 1304 | رخصة لهواة رياضة الصيد غوصاً تحت الماء (بواسطة البندقية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR211-05.pdf |
| 1305 | رخصة لهواة رياضة الغوص تحت الماء (قنينة او اسطوانات) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR211-01-SP.pdf |
| 1306 | شروط الترخيص لتعاطي مهنة استيراد الاسمدة ومحسنات التربة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/AGR12-03.pdf |
| 1308 | شق طريق زراعية في المناطق النائية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476362/GRPL1-02.pdf |
| 1309 | شهادة صحية للمواد الغذائية المصنعة او المحولة من أصل نباتي عند التصدير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%B4%D9%87%D8%A7%D8%AF%D8%A9%20%D8%B5%D8%AD%D9%8A%D8%A9%20%D9%84%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%D8%A7%D9%84%D8%BA%D8%B0%D8%A7%D8%A6%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B5%D9%86%D8%B9%D8%A9%20%D8%A3%D9%88%20%D8%A7%D9%84%D9%85%D8%AD%D9%88%D9%84%D8%A9%20%D9%85%D9%86%20%D8%A3%D8%B5%D9%84%20%D9%86%D8%A8%D8%A7%D8%AA%D9%8A.pdf |
| 1311 | طلب إجازة مسبقة لاستيراد الخيل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR342-01-SP.pdf |
| 1312 | طلب إذن صحي مسبق لإستيراد الدواجن ومشتقاتها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR341-01.pdf |
| 1314 | طلب إفادة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%A5%D9%81%D8%A7%D8%AF%D8%A9%20%D8%AA%D8%B7%D9%84%D8%A8%20%D9%84%D8%A5%D9%84%D8%B9%D9%81%D8%A7%D8%A1%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B1%D8%B3%D9%88%D9%85%20%D9%88%D8%A7%D9%84%D8%B6%D8%B1%D8%A7%D8%A6%D8%A8%20%D9%85%D9%86%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D8%B1%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9%20%D9%84%D9%84%D8%AA%D8%B9%D8%A7%D9%88%D9%86%D9%8A%D8%A7%D8%AA.pdf |
| 1315 | طلب إنشاء اتحاد تعاوني اقليمي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%86%D8%B4%D8%A7%D8%A1%20%D8%A5%D8%AA%D8%AD%D8%A7%D8%AF%20%D8%AA%D8%B9%D8%A7%D9%88%D9%86%D9%8A%20%D8%A5%D9%82%D9%84%D9%8A%D9%85%D9%8A.pdf |
| 1316 | طلب إنشاء جمعية متحدة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%86%D8%B4%D8%A7%D8%A1%20%D8%AC%D9%85%D8%B9%D9%8A%D8%A9%20%D9%85%D8%AA%D8%AD%D8%AF%D8%A9.pdf |
| 1317 | طلب استصلاح الأراضي والأعمال التكميلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476362/GRPL1-01.pdf |
| 1319 | طلب استيراد الحليب المجفف المعبأ في غير بلد المنشأ (مجمد حالياً) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR321-02.pdf |
| 1322 | طلب الحصول على أدوية لمكافحة أمراض النحل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR123-02.pdf |
| 1323 | طلب الحصول على التسجيل الصحي لمصانع المنتجات الغذائية من أصل حيواني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR321-07.pdf |
| 1325 | طلب الحصول على ترخيص لتعاطي مهنة بيع الأدوية الزراعية من العموم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-05-SP.pdf |
| 1327 | طلب الحصول على نصوب حرجية وتزيينية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR123-03.pdf |
| 1329 | طلب تأسيس جمعية تعاونية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%A3%D8%B3%D9%8A%D8%B3%20%D8%AC%D9%85%D8%B9%D9%8A%D8%A9%20%D8%AA%D8%B9%D8%A7%D9%88%D9%86%D9%8A%D8%A9.pdf |
| 1330 | طلب تأسيس صندوق تعاضدي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/575714/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%A3%D8%B3%D9%8A%D8%B3%20%D8%B5%D9%86%D8%AF%D9%88%D9%82%20%D8%AA%D8%B9%D8%A7%D8%B6%D8%AF%D9%8A.pdf |
| 1331 | طلب ترخيص بمزاولة مهنة الطب البيطري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR205.pdf |
| 1332 | طلب ترخيص لتعاطي مهنة صنع الأدوية الزراعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-06-SP.pdf |
| 1341 | كشف على إرساليات مستوردة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR111-03.pdf |
| 1342 | كشف على إرساليات مصدرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477298/AGR111-01.pdf |

### وزارة الصحة العامة (36)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1686 | إجازة فتح مختبر طبي عام في مستشفى | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D9%85%D9%86%D8%B4%D8%A3%D8%A9%20%D8%B5%D8%AD%D9%8A%D8%A9%20%D8%AF%D8%A7%D8%AE%D9%84%20%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89.pdf |
| 1687 | إجازة فتح مركز لجمع العينات تابع لمختبر طبي مرخص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE212-05.pdf |
| 1688 | إجازة فتح مصرف دم في مستشفى | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE212-02.pdf |
| 1689 | إجازة فتح واستثمار مركز للعلاج الفيزيائي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE212-03.pdf |
| 1690 | إدارة صيدلية ليلاً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-09.pdf |
| 1691 | إلغاء مستودع أدوية أو رخصة صيدلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-03.pdf |
| 1693 | استمارة إبلاغ ومتابعة عن حالات التدرن الرئوي (السل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%A5%D8%B3%D8%AA%D9%85%D8%A7%D8%B1%D8%A9%20%D8%A5%D8%A8%D8%A7%D9%84%D8%BA%20%D8%B9%D9%86%20%D8%A7%D8%A5%D9%84%D8%B5%D8%A7%D8%A8%D8%A9%20%D8%A8%D9%85%D8%B1%D8%B6%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%86%20%D8%A7%D9%84%D8%B1%D8%A6%D9%88%D9%8A.pdf |
| 1695 | استيراد مياه ومرطبات معبأة في أوعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%8A%D8%B1%D8%A7%D8%AF%20%D9%85%D9%8A%D8%A7%D9%87%20%D8%A3%D9%88%20%D9%85%D8%B1%D8%B7%D8%A8%D8%A7%D8%AA.pdf |
| 1697 | الاستفادة من التغطية الصحية في وزارة الصحة العامة (موافقة علاج خارجي أو دخول مستشفى خاص على نفقة الوزارة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE211-06.pdf |
| 1700 | الترخيص بفتح واستثمار دار حضانة للأطفال | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D8%A8%D9%81%D8%AA%D8%AD%20%D9%88%D8%A5%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20%D8%AF%D8%A7%D8%B1%20%D8%AD%D8%B6%D8%A7%D9%86%D8%A9%20%D9%84%D8%A3%D9%84%D8%B7%D9%81%D8%A7%D9%84.pdf |
| 1702 | الحصول على إجازة حمل لقب اختصاص طبي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A7%D9%84%D8%AD%D8%B5%D9%88%D9%84%20%D8%B9%D9%84%D9%89%20%D8%A5%D8%AC%D8%A7%D8%B2%D8%A9%20%D8%AD%D9%85%D9%84%20%D9%84%D9%82%D8%A8%20%D8%A5%D8%AE%D8%AA%D8%B5%D8%A7%D8%B5%20%D8%B7%D8%A8%D9%8A.pdf |
| 1712 | بيع وشراء مستودع أدوية من صاحبه الصيدلي او من شركة مستودع ادوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-01.pdf |
| 1716 | حصول الصيدلي (صاحب صيدلية خاصة او مدير فني في صيدلية مستشفى) على دفتر شراء او على سجل مواد نفسية/مخدرات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE222-04.pdf |
| 1717 | حصول الصيدلي (صاحب صيدلية خاصة او مدير فني في صيدلية مستشفى) على سجل تسليم مخدرات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE222-01.pdf |
| 1718 | حصول الطبيب على سجل وصفات مواد مخدرة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE222-03.pdf |
| 1720 | طلب إجازة فتح واستثمار مستودع أدوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%AC%D8%A7%D8%B2%D8%A9%20%D9%81%D8%AA%D8%AD%20%D9%88%D8%A5%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20%D9%85%D8%B3%D8%AA%D9%88%D8%AF%D8%B9%20%D8%A3%D8%AF%D9%88%D9%8A%D8%A9.pdf |
| 1721 | طلب إدخال متممات غذائية وأعشاب طبية طبيعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%AF%D8%AE%D8%A7%D9%84%20%D9%85%D8%AA%D9%85%D9%85%D8%A7%D8%AA%20%D8%BA%D8%B0%D8%A7%D8%A6%D9%8A%D8%A9%20%D9%88%D8%A3%D8%B9%D8%B4%D8%A7%D8%A8%20%D8%B7%D8%A8%D9%8A%D8%A9%20%D8%B7%D8%A8%D9%8A%D8%B9%D9%8A%D8%A9.pdf |
| 1723 | طلب استيراد ادوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%8A%D8%B1%D8%A7%D8%AF%20%D8%A3%D8%AF%D9%88%D9%8A%D8%A9.pdf |
| 1724 | طلب استيراد حليب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%8A%D8%B1%D8%A7%D8%AF%20%D8%AD%D9%84%D9%8A%D8%A8%20%D9%84%D8%A3%D9%84%D8%B7%D9%81%D8%A7%D9%84%20%D9%85%D8%A7%20%D8%AF%D9%88%D9%86%20%D8%A7%D9%84%D8%B3%D9%86%D8%A9%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B9%D9%85%D8%B1.pdf |
| 1725 | طلب استيراد مستحضر مصنف بحكم الدواء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%8A%D8%B1%D8%A7%D8%AF%20%D9%85%D8%B3%D8%AA%D8%AD%D8%B6%D8%B1%20%D9%85%D8%B5%D9%86%D9%81%20%D8%A8%D8%AD%D9%83%D9%85%20%D8%A7%D9%84%D8%AF%D9%88%D8%A7%D8%A1.pdf |
| 1726 | طلب استيراد مواد اولية لصناعة الدواء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE221-01.pdf |
| 1727 | طلب استيراد وتصدير ادوية للاستعمال الشخصي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE221-03.pdf |
| 1729 | طلب الانتساب إلى سجل المرضى المصابين بالقصور الكلوي المزمن | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE211-05.pdf |
| 1730 | طلب ترخيص إنشاء مصنع للأدوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D8%A5%D9%84%D9%86%D8%B4%D8%A7%D8%A1%20%D9%85%D8%B5%D9%86%D8%B9%20%D8%A3%D8%AF%D9%88%D9%8A%D8%A9.pdf |
| 1731 | طلب ترخيص بإستثمار مستشفى | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D8%A8%D8%A5%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89.pdf |
| 1732 | طلب تسجيل مستحضر صيدلاني مستورد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D9%85%D8%B3%D8%AA%D8%AD%D8%B6%D8%B1%20%D8%B5%D9%8A%D8%AF%D8%A7%D9%84%D9%86%D9%8A%20%D9%85%D8%B3%D8%AA%D9%88%D8%B1%D8%AF.pdf |
| 1733 | طلب تصدير ادوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE221-07.pdf |
| 1734 | طلب تصدير دم بشري او انسجة للتحليل في الخارج (شخصي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE221-04.pdf |
| 1735 | طلب تفرغ صيدلي مدير فني في شركة مستودع أدوية مرخص لصيدلي آخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-16.pdf |
| 1737 | طلب فتح واستثمار مركز علاج فيزيائي داخل مستشفى | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D9%85%D9%86%D8%B4%D8%A3%D8%A9%20%D8%B5%D8%AD%D9%8A%D8%A9%20%D8%AF%D8%A7%D8%AE%D9%84%20%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89.pdf |
| 1738 | طلب لانابة صيدلي في ادارة صيدلية مستشفى | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-10.pdf |
| 1741 | طلب نقل موقع صيدلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D9%86%D9%82%D9%84%20%D9%85%D9%88%D9%82%D8%B9%20%D8%B5%D9%8A%D8%AF%D9%84%D9%8A%D8%A9.pdf |
| 1742 | طلب استيراد ادوية او لقاحات بيطرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576152/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%8A%D8%B1%D8%A7%D8%AF%20%D8%A3%D8%AF%D9%88%D9%8A%D8%A9%20%D8%A3%D9%88%20%D9%84%D9%82%D8%A7%D8%AD%D8%A7%D8%AA%20%D8%A8%D9%8A%D8%B7%D8%B1%D9%8A%D8%A9.pdf |
| 1745 | فتح خزانة أدوية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE22-05.pdf |
| 1746 | فتح مختبر طبي خاص متخصص بالتحاليل بالنظائر المشعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE212-09.pdf |
| 1748 | فتح واستثمار مركز تجميل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477440/PHE212-13.pdf |

### بوابة دولتي - خدمات إلكترونية (32)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 117 | إصدار بطاقة وسيط ضمان جديدة صالحة لمدة سنتين من تاريخ صدورها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-02.pdf |
| 120 | إيداع وسم صياغة المجوهرات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR162-02.pdf |
| 123 | استلام لوائح مفصلة بأسعار السلع والمنتجات المستوردة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR14-02.pdf |
| 124 | استلام لوائح مفصلة بأسعار السلع والمنتجات المصنعة محلياً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR14-01.pdf |
| 130 | الترخيص لتنظيم وإقامة المعارض للمنتجات اللبنانية في الخارج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR123-01.pdf |
| 131 | الخطوات المطلوبة لإستيراد وعبور وتصدير الالماس الخام في الأراضي اللبنانية (نظام كمبرلي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR161-07(2).pdf |
| 137 | ترخيص باستثمار علامة أو نموذج صناعي أو براءة اختراع أو أثر فني أو أدبي أو موسيقي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D8%A8%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20%D8%B9%D8%A7%D9%84%D9%85%D8%A9%20%D8%A3%D9%88%20%D9%86%D9%85%D9%88%D8%B0%D8%AC%20%D8%B5%D9%86%D8%A7%D8%B9%D9%8A%20%D8%A3%D9%88%20%D8%A8%D8%B1%D8%A7%D8%A1%D8%A9%20%D8%A5%D8%AE%D8%AA%D8%B1%D8%A7%D8%B9%20%D8%A3%D9%88%20%D8%A3%D8%AB%D8%B1%20%D9%81%D9%86%D9%8A%20%D8%A3%D9%88%20%D8%A3%D8%AF%D8%A8%D9%8A%20%D8%A3%D9%88%20%D9%85%D9%88%D8%B3%D9%8A%D9%82%D9%8A.pdf |
| 139 | ترخيص لشركة أجنبية بممارسة أعمال الضمان وإعادة الضمان في لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR15-06.pdf |
| 142 | ترخيص لشركة لبنانية بممارسة أعمال الضمان وإعادة الضمان ( فرع الحياة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR15-02.pdf |
| 143 | ترخيص للجهات الأجنبية بتنظيم وإقامة المعارض على الأراضي اللبنانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR123-03.pdf |
| 144 | ترخيص للشركات اللبنانية بتنظيم وإقامة السوق على الأراضي اللبنانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR123-04_(1).pdf |
| 145 | ترخيص للشركات اللبنانية بتنظيم وإقامة المعارض على الأراضي اللبنانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR123-02_(2).pdf |
| 146 | ترخيص لممارسة مهنة وسيط ضمان ( شخص طبيعي مستقل) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-10.pdf |
| 147 | ترخيص لممارسة مهنة وسيط ضمان (شخص معنوي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-01.pdf |
| 148 | ترخيص لممارسة مهنة وسيط ضمان بصفة مندوب شركة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-08(1).pdf |
| 149 | ترخيص لهيئات الضمان الأجنبية في ممارسة عمليات إعادة الضمان فقط بواسطة ممثل له مركز في لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR15-03.pdf |
| 150 | تسجيل أثر فني أو أدبي أو موسيقي أو سينمائي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR13-08.pdf |
| 152 | تسجيل عقد تمثيل تجاري (وكالة حصرية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR122-04.pdf |
| 160 | تسديد رسوم سنوية عن عقود التمثيل التجاري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR122-03.pdf |
| 162 | تعيير ووسم القبابين والموازين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B9%D9%8A%D9%8A%D8%B1%20%D9%88%D9%88%D8%B3%D9%85%20%D8%A7%D9%84%D9%82%D8%A8%D8%A7%D8%A8%D9%8A%D9%86.pdf |
| 163 | تعيير ووسم مضخات المحروقات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR161-02.pdf |
| 164 | تنمية المبيعات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR16-03.pdf |
| 166 | سحب ترخيص شركة وساطة الضمان( شخص معنوي) أو شخص طبيعي مستقل وإسترداد الكفالة المصرفية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-04.pdf |
| 167 | سحب ترخيص مندوب شركة الضمان وإسترداد الكفالة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR152-03.pdf |
| 169 | طلب إستفسار عن وضع شركة، أشخاص، فنانين، افلام أو بواخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR17-01.pdf |
| 170 | طلب إفادة عن علامة أو نموذج صناعي أو براءة اختراع أو أثر فني أو أدبي أو موسيقي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%81%D8%A7%D8%AF%D8%A9%20%D8%B9%D9%86%20%D8%B9%D8%A7%D9%84%D9%85%D8%A9%20%D8%A3%D9%88%20%D9%86%D9%85%D9%88%D8%B0%D8%AC%20%D8%B5%D9%86%D8%A7%D8%B9%D9%8A%20%D8%A3%D9%88%20%D8%A8%D8%B1%D8%A7%D8%A1%D8%A9%20%D8%A5%D8%AE%D8%AA%D8%B1%D8%A7%D8%B9%20%D8%A3%D9%88%20%D8%A3%D8%AB%D8%B1%20%D9%81%D9%86%D9%8A%20%D8%A3%D9%88%20%D8%A3%D8%AF%D8%A8%D9%8A%20%D8%A3%D9%88%20%D9%85%D9%88%D8%B3%D9%8A%D9%82%D9%8A.pdf |
| 171 | طلب تركيب / تصليح مضخات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D9%83%D9%8A%D8%A8%20%20%D8%AA%D8%B5%D9%84%D9%8A%D8%AD%20%D9%85%D8%B6%D8%AE%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%AD%D8%B1%D9%88%D9%82%D8%A7%D8%AA.pdf |
| 172 | طلب زراعة وتسليم قمح. | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR31-01.pdf |
| 175 | كيل الصهاريج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR161-06.pdf |
| 176 | كيل الصهاريج الجديدة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR161-01.pdf |
| 177 | كيل عداد صهريج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476634/ETR161-05.pdf |
| 180 | معلومات تجارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%A5%D8%B1%D8%B4%D8%A7%D8%AF%D8%A7%D8%AA%20%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%88%D8%AC%D9%88%D8%AF%20%D9%81%D8%B1%D8%B9%20%D8%B4%D8%B1%D9%83%D8%A9%D8%8C%20%D9%85%D9%83%D8%AA%D8%A8%20%D8%AA%D9%85%D8%AB%D9%8A%D9%84%20%D9%88%D9%83%D9%8A%D9%84%20%D8%AD%D8%B5%D8%B1%D9%8A%20%D8%A5%D8%B4%D8%A7%D8%B1%D8%A9%20%D8%AF%D8%B9%D9%88%D9%89.pdf |

### وزارة المالية (32)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 2157 | إجازة بيع &#034; بائع جملة &#034; | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN41-01.pdf |
| 2158 | إجازة بيع بالمفرق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN41-02.pdf |
| 2160 | إستكمال المستندات وتحرير التركة وتحقيق رسم الإنتقال | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN121-03.pdf |
| 2164 | إعتراض على البيان بالقيمة التأجيرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-12(1).pdf |
| 2170 | إفادة نفي ملكية لغير اللبنانيين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN2-30.pdf |
| 2175 | اعتراض على التكليف بالضريبة والأخطاء المادية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-13(2).pdf |
| 2177 | اعلام بالرقم الشخصي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-03.pdf |
| 2179 | الإعتراض على الضرائب التصاعدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-14(1).pdf |
| 2183 | الترخيص بإستيراد المنتجات التبغية وبيعها في لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN41-03.pdf |
| 2187 | التصريح الإضافي بالأموال او الحقوق التي آلت بطريق الإرث أو الوصية أو الهبة أو الوقف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN121-02.pdf |
| 2188 | التصريح عن عقود التأمين على الحياة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN121-05.pdf |
| 2189 | التفرغ عن الحصص في شركة أشخاص أو شركة محدودة المسؤولية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-43(2).pdf |
| 2199 | تسليم إيصال التوقيفات العشرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN111-01.pdf |
| 2201 | تصحيح خطأ في شھادة تسجيل المكلّف لدى وزارة المالية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-04.pdf |
| 2203 | تصريح إفراز عقار مبني أو غير مبني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-05(1).pdf |
| 2204 | تصريح التوقف عن العمل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-41.pdf |
| 2205 | تصريح عن إنشاءات جديدة أو محورة أو مضافة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-03(1).pdf |
| 2206 | تصريح عن الشغور | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-07(1).pdf |
| 2218 | رسم 5% على بدلات الطعام والشراب والإقامة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN124-05(2).pdf |
| 2230 | طلب إفادة عن تقسيمات وبدلات الإيجار | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-04(2).pdf |
| 2231 | طلب اعتماد سنة مالية خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-09.pdf |
| 2232 | طلب بدل عن ضائع سند ملكية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN2-23.pdf |
| 2233 | طلب براءة ذمة عقارية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-02(3).pdf |
| 2234 | طلب براءة ذمة مالية لقبض تعويض استملاك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN122-01.pdf |
| 2240 | طلب تعديل في الشكل القانوني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-16(2).pdf |
| 2241 | طلب تعديل في عنوان المكلف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-17(2).pdf |
| 2242 | طلب تكليف مشتري بضريبة الأملاك المبنية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN123-10(1).pdf |
| 2244 | طلب رفع إشارة التأمين عن عقار أو عن مؤسسة تجارية أو عن مركبة آلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN125-30.pdf |
| 2245 | طلب رفع إشارة ضريبة التحسين عن الصحيفة العينية للعقار | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN122-02.pdf |
| 2250 | عقد بيع أو إستثمار أو بيع بالإسترداد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN2-19.pdf |
| 2254 | عقد مقاسمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN2-07.pdf |
| 2255 | عقد هبة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476728/FIN2-03.pdf |

### وزارة الدفاع الوطني (26)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1202 | إحداثيات نقطة إرتفاع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-21.pdf |
| 1203 | إحداثيات نقطة تثليث شبكة قديمة أو شبكة جديدة (GPS) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-22.pdf |
| 1209 | الاستحصال على بطاقة الاحتياط (للخدمة الفعلية) المسرحين حديثا&#034; من الجيش | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-24.pdf |
| 1213 | الاعفاء المؤقت من الخدمة في الإحتياط - الذي تثبت اللجنة الطبية المختصة لدى وزارة الدفاع الوطني أنه مصاب بعاهة أو مرض قابل للشفاء ومنعه من تنفيذ الزاميات الإحتياط مؤقتاً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-03.pdf |
| 1214 | الاعفاء المؤقت من الخدمة في الإحتياط - الذي يتابع تحصيله العلمي في الداخل أو الخارج شرط ألا يتجاوز الثلاثين من عمره | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-01.pdf |
| 1215 | الاعفاء المؤقت من الخدمة في الإحتياط - المقيم خارج البلاد للعمل منذ أكثر من ستة أشهر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-02.pdf |
| 1216 | الاعفاء المؤقت من الخدمة في الإحتياط - الموقوف بجناية أو جنحة حتى صدور الحكم بحقه وتنفيذ العقوبةً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-04.pdf |
| 1217 | الاعفاء المؤقت من الخدمة في الإحتياط - رؤساء وأعضاء الحكومة والمجلس النيابي ورؤساء وأعضاء البلديات والمخاتير طيلة مدة عضويتهم وموظفو القطاع العام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-05.pdf |
| 1218 | الاعفاء المؤقت من الخدمة في الإحتياط- حالات أخرى يؤخذ بها بعين الإعتبار إنعكاسات إستدعاء الإحتياط على الصالح العام في البلاد وخاصة في مجالي الإدارة العامة والإقتصاد وتحدد هذه الحالات بمرسوم يتخذ في مجلس الوزراء بناءً على إقتراح وزير الدفاع الوطني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE141-07.pdf |
| 1227 | تكبير قسم من صورة جوية (4 أو 5 مرات) 5 سم × 5 سم حتى 25سم × 25 سم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-07.pdf |
| 1228 | تكبير كامل الصورة الجوية (4 أو 5 مرات) 24 سم × 24 سم حتى 100 سم × 100 سم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-09.pdf |
| 1229 | تكبير كامل الصورة الجوية (مرتين) 24 سم × 24 سم حتى 60 سم ×60 سم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-08.pdf |
| 1237 | خريطة الطرقات للمناطق 100000/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-03.pdf |
| 1238 | خريطة بيروت السياحية 7000/1 &#x2013; 7500/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-04.pdf |
| 1240 | خريطة حدود المحافظات والأقضية للبنان 200000/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-30.pdf |
| 1243 | خريطة لبنان السياحية أو العامة أو الإدارية 200000/1 - رقمية Vector مسجلة على CD وعلى ورق فاخر | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-33.pdf |
| 1244 | خريطة لبنان على قماش مع خشب 200000/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-05.pdf |
| 1246 | شكوى (تحصيل ديون - خلافات &#x2013; حوادث سير- أحوال شخصية - توكيل محامي...). | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE13-01.pdf |
| 1247 | صورة جوية ورق (Contact) أسود وأبيض 18سم × 18سم أو 24سم × 24 سم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-07.pdf |
| 1248 | طلب إجراء تحقيق عن المؤسسة العسكرية في وسائل الإعلام (المكتوبة و المرئية و المسموعة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE2-01.pdf |
| 1252 | طلب تصوير فيلم أكاديمي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE2-02.pdf |
| 1253 | طلب تصوير فيلم استثماري - تجاري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE2-03.pdf |
| 1254 | طلب تعاقد مع وزارة الدفاع الوطني - قيادة الجيش | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE13-02.pdf |
| 1260 | مجموعة خرائط المناطق العقارية (121 قسيمة) 20000/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-29.pdf |
| 1261 | مسح ضوئي على آلة (Ultra Scan (Geodetic Scanner - للصورة الجوية 23 سم × 23 سم أو 18 سم × 18 سم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-10.pdf |
| 1262 | مسطح تيراج أوزاليد 1000/1 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477132/NDE42-12.pdf |

### وزارة الثقافة (20)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 975 | الترخيص بإنشاء دار نشر (المادة 71) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576158/%D8%B7%D9%84%D8%A8%20%D8%B1%D8%AE%D8%B5%D8%A9%20%D8%AF%D8%A7%D8%B1%20%D9%86%D8%B4%D8%B1.pdf |
| 976 | امتلاك مطبعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576158/%D8%AA%D8%B5%D8%B1%D9%8A%D8%AD%20%D8%A8%D8%A5%D9%85%D8%AA%D8%A7%D9%84%D9%83%20%D9%85%D8%B7%D8%A8%D8%B9%D8%A9.pdf |
| 977 | تسعير الكتب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576130/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B3%D8%B9%D9%8A%D8%B1%20%D8%A7%D9%84%D9%83%D8%AA%D8%A8.pdf |
| 978 | طلب إجراء حفرية أثرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-14.pdf |
| 979 | طلب إخراج عينات للتحليل والدراسة خارج لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-18.pdf |
| 980 | طلب إخراج قطعة (قطع) أثرية للتحليل والدراسة خارج لبنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-17.pdf |
| 981 | طلب إخراج من لائحة الجرد العام للأبنية التاريخية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-11.pdf |
| 982 | طلب إدخال مؤقت إلى لبنان لمعدات تقنية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-15.pdf |
| 983 | طلب إذن بالتصوير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-01.pdf |
| 984 | طلب إسترداد عقار مستملك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-09.pdf |
| 985 | طلب إستملاك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-07.pdf |
| 987 | طلب إنتساب مؤلف يطبع على حسابه للترقيم الدولي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/579782/CUL002.pdf |
| 988 | طلب الموافقة على شراء كتاب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT1-02.pdf |
| 989 | طلب الموافقة على شراء لوحة فنية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT_1-01.pdf |
| 990 | طلب الموافقة على نشر مقال | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT2-21.pdf |
| 991 | طلب دعم إفرادي للمبدعين في المجالات الثقافية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT_1-03.pdf |
| 992 | طلب دعم الهيئات والنوادي الثقافية التي لا تتوخى الربح | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/579782/CUL001.pdf |
| 993 | طلب دعم عمل مسرحي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT11-03.pdf |
| 994 | طلب دعم فيلم سينمائي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT11-01.pdf |
| 995 | طلب دعم نشاط سينمائي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477070/CLT11-02.pdf |

### وزارة التربية والتعليم العالي (19)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 900 | إجازة بدون راتب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE11-11.pdf |
| 919 | الوضع خارج الملاك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE11-03.pdf |
| 920 | الوضع في الاستيداع بسبب المرض | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE11-02.pdf |
| 932 | تعاقد للتدريس | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576147/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B9%D8%A7%D9%82%D8%AF%20%29%D8%AC%D8%AF%D9%8A%D8%AF%20%D8%A7%D9%88%20%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF%20%D8%AA%D8%B9%D8%A7%D9%82%D8%AF%28.pdf |
| 944 | طلب إضافة طابق إلى مبنى مدرسة وزيادة عدد التلاميذ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-18.pdf |
| 945 | طلب إضافة مراحل تعليمية إلى إجازة مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-15.pdf |
| 949 | طلب الترخيص بالمباشرة بالتدريس في مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-16.pdf |
| 950 | طلب الحصول على مرسوم إجازة فتح مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-06.pdf |
| 951 | طلب بدل من ضائع أو تالف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE31-01.pdf |
| 952 | طلب ترشيح لامتحانات الكولوكيوم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_41-02.pdf |
| 953 | طلب تغيير إسم مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-17.pdf |
| 954 | طلب حصر إجازة مدرسة خاصة بإسم شريك فيها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-12.pdf |
| 955 | طلب نقل مقر مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_471-14.pdf |
| 958 | طلبات إنهاء الخدمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE481-24.pdf |
| 965 | معادلة الشهادات الجامعية الصادرة من الجامعات والمعاهد الجامعية اللبنانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_23-01.pdf |
| 966 | معادلة الشهادات الجامعية الصادرة من جامعات المملكة المتحدة (بريطانيا) ودول الكومنولث | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_23-03.pdf |
| 967 | معادلة الشهادات الجامعية الصادرة من دول اميركا الشمالية (الولايات المتحدة الامريكية، كندا) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE_23-02.pdf |
| 969 | معادلة جميع الصفوف الدراسية من السادس الأساسي إلى الثاني الثانوي ضمناً، أو الثالث الثانوي رسوباً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE43-04.pdf |
| 971 | وضع في الاستيداع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477626/EHE481-31.pdf |

### وزارة الداخلية والبلديات (18)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1017 | Illegal Birth Registration (Lebanese citizen living abroad) - E-Services Detail | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595592/FOR-005-SP.pdf |
| 1019 | إبدال دين أو مذهب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU28-04.pdf |
| 1043 | اكتساب المرأة الأجنبية الجنسية اللبنانية لزواجها من لبناني | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU23-01.pdf |
| 1067 | تسجيل زواج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU28-11.pdf |
| 1089 | حادث سير بين آلية عسكرية وسيارة مدنية أدى الحادث إلى إصابة العسكري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU11-04.pdf |
| 1091 | حفظ أمن ونظام وتنظيم سير (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU11-01.pdf |
| 1092 | حفظ الأمن والنظام على مداخل الأماكن الخاصة المسوّرة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU11-02.pdf |
| 1093 | حفظ الأمن والنظام في ميدان سباق الخيل وفي الحفلات الرياضية أو المباريات الرياضية (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU11-03.pdf |
| 1138 | طلب تسجيل وثيقة إكتساب أو إلغاء جنسية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595592/FOR-003-SP.pdf |
| 1139 | طلب تسجيل وثيقة طلاق (لبناني مقيم خارج لبنان) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576593/FOR-001IP.pdf |
| 1144 | طلب رخصة إستثمار مدرسة في بناء موجود | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-08.pdf |
| 1146 | طلب رخصة بناء جديد مدرسة خاصة أو إضافة بناء على مدرسة خاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-05.pdf |
| 1147 | طلب رخصة بناء سكني جديد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-04.pdf |
| 1148 | طلب رخصة بناء مستشفى خاص أو إضافة على مستشفى خاص | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-03.pdf |
| 1149 | طلب رفع إشارة عن بناء لا يتضمن ملجأ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-02.pdf |
| 1150 | طلب رفع إشارة عن بناء يتضمن ملجأ مخالف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU51-01.pdf |
| 1173 | نقل ومواكبة أموال من مؤسسات خاصة (خدمات مأجورة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU11-05.pdf |
| 1174 | وثيقة تبديل مكان (قيد) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477736/IMU27-07.pdf |

### وزارة السياحة (13)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1361 | إشتراك بمياه الري ( مشروع ري القاسمية ورأس العين ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476302/LITA11-07.pdf |
| 1362 | إشتراك بمياه الري ( مشروع ري صيدا ـ جزين ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476302/LITA11-08.pdf |
| 1364 | إفادة عدم انتفاع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476302/LITA11-03.pdf |
| 1365 | إلغاء إشتراك بالري | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476302/LITA11-04.pdf |
| 1367 | براءة ذمة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476302/LITA11-01.pdf |
| 1369 | ترخيص مطعم أو سناك (بناء قائم) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/570729/%D9%85%D8%B3%D8%AA%D9%86%D8%AF%D8%A7%D8%AA%20%D8%A3%D8%AE%D8%B1%D9%89%20%D9%84%D9%84%D9%85%D8%A4%D8%B3%D8%B3%D8%A7%D8%AA%20%D8%AA%D8%AD%D8%AA%20%D9%86%D8%B7%D8%A7%D9%82%20%D8%A7%D9%84%D9%85%D8%B7%D8%A7%D8%B9%D9%85%20%D9%88%D8%A7%D9%84%D9%85%D9%84%D8%A7%D9%87%D9%8A.pdf |
| 1370 | ترخيص مقهى (بناء قائم) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/570729/%D9%85%D8%B3%D8%AA%D9%86%D8%AF%D8%A7%D8%AA%20%D8%A3%D8%AE%D8%B1%D9%89%20%D9%84%D9%84%D9%85%D8%A4%D8%B3%D8%B3%D8%A7%D8%AA%20%D8%AA%D8%AD%D8%AA%20%D9%86%D8%B7%D8%A7%D9%82%20%D8%A7%D9%84%D9%85%D8%B7%D8%A7%D8%B9%D9%85%20%D9%88%D8%A7%D9%84%D9%85%D9%84%D8%A7%D9%87%D9%8A.pdf |
| 1375 | طلب إفادة عن وضع مؤسسة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/570729/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%81%D8%A7%D8%AF%D8%A9%20%D8%B9%D9%86%20%D9%85%D8%A4%D8%B3%D8%B3%D8%A9%20%D8%BA%D9%8A%D8%B1%20%D8%AE%D8%A7%D8%B6%D8%B9%D8%A9%20%D9%84%D9%85%D8%B1%D8%A7%D9%82%D8%A8%D8%A9%20%D9%88%D8%B2%D8%A7%D8%B1%D8%A9%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9%D8%B1%D8%A9%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9.pdf |
| 1379 | طلب تأسيس وكالة تأجير السيارات السياحية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576174/%D8%B7%D9%84%D8%A8%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D9%81%D9%82%D8%A9%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D9%84%D9%88%D9%83%D8%A7%D9%84%D8%A9%20%D8%AA%D8%A3%D8%AC%D9%8A%D8%B1%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A%D8%A9%20%29%D9%81%D8%A6%D8%A9%20%D8%AB%D8%A7%D9%84%D8%AB%D8%A9%28.pdf |
| 1380 | طلب مساعدة إضافية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476378/COTS1-19.pdf |
| 1382 | طلب منح مدرسية لأبناء المعتقلين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476378/COTS1-16.pdf |
| 1383 | طلب منح مدرسية لأولاد الشهداء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476378/COTS1-17.pdf |
| 1387 | نقل ترخيص (نقل ملكية أو نقل مكان) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/570729/%D9%86%D9%82%D9%84%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D8%A3%D9%88%20%D9%86%D9%82%D9%84%20%D9%85%D9%84%D9%83%D9%8A%D8%A9%20%D9%88%D9%83%D8%A7%D9%84%D8%A9%20%D9%85%D9%86%20%D8%A7%D9%84%D9%81%D8%A6%D8%A9%20%D8%A7%D9%84%D8%A3%D9%88%D9%84%D9%89%20%D8%A3%D9%88%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%8A%D8%A9%20%D8%A3%D9%88%20%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB%D8%A9.pdf |

### وزارة الاتصالات (12)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 299 | إعتراض على الرسوم البلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-22.pdf |
| 300 | إعلام البلدية عن تبديل في الشاغلين (نقل ملكية، مستأجر جديد، مستثمر جديد، إشغال جديد) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-05.pdf |
| 301 | إعلام البلدية عن تعديل في وجهة الاستعمال | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-06.pdf |
| 303 | الإفادات والبيانات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-03.pdf |
| 305 | الموافقة على إشغال الأملاك العمومية البلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-12.pdf |
| 306 | براءة ذمة بلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-01.pdf |
| 307 | تخمين الثمن البيعي للمتر المربع من أرض عقار | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-19.pdf |
| 309 | تصريح باستعمال الآلات الميكانيكية في ورش البناء والأشغال العامة وغيرها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-24.pdf |
| 311 | رخصة إشغال - رخصة سكن | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-08.pdf |
| 312 | شكوى أو مراجعة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-23.pdf |
| 315 | طلب تقسيط رسوم بلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-20.pdf |
| 317 | طلب رخصة مصعد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474872/MBT1-02.pdf |

### وزارة الداخلية والبلديات - البلديات (12)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1186 | إفادة إنجاز بناء مخالف | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-27.pdf |
| 1188 | الموافقة على الترخيص لمحلات ومحطات توزيع المحروقات السائلة. | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-06.pdf |
| 1189 | براءة ذمة بلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-22.pdf |
| 1191 | ترخيص بإشغال الأملاك العمومية البلدية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-08.pdf |
| 1192 | ترخيص باحتراف المهن بالتجول | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-09.pdf |
| 1193 | ترخيص بالترميم أو إضافة بناء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-02.pdf |
| 1194 | ترخيص للإعلان الدائم والمؤقت ( وضع لوحة إعلانية ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-04.pdf |
| 1195 | تسجيل عقد الإيجار | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-12.pdf |
| 1196 | تسوية مخالفة بـنـاء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-18.pdf |
| 1197 | تصريح بالترميم أو بناء التصاوين أو بناء جدران دعم أو أعمال تسويات الأرض أو أعمال الهدم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-17.pdf |
| 1198 | ربط مجرور المياه المبتذلة بالمجرور العام | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-20.pdf |
| 1199 | رخصة أشغال (إسكان) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/474810/MUN1-03.pdf |

### وزارة الصناعة (12)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1761 | إجازة استيراد | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-01.pdf |
| 1762 | إجازة تصدير | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-07.pdf |
| 1765 | تسجيل معمل او مصنع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-05.pdf |
| 1766 | تصديق شهادة المنشأ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-03.pdf |
| 1767 | تصريح صناعي ( تسجيل المؤسسات الصناعية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-04.pdf |
| 1768 | تصريح عن المنتجات الوطنية المصدرة الى الخارج والمواد المستوردة الداخلة في صناعتها والمطلوب رد الرسوم المستوفاة عنها. | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND12-02.pdf |
| 1769 | تصريح عن نقل ملكية أو استثمار مؤسسة صناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND13-07.pdf |
| 1770 | شهادة إستهلاك مواد مبللة ( أولية وخلافها) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-06.pdf |
| 1771 | طلب إستحصال على شهادة أو إفادة صناعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND11-02.pdf |
| 1772 | طلب الترخيص بإنشاء مؤسسة صناعية من الفئة الأولى والثانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND13-01.pdf |
| 1775 | طلب تعديل أو تغيير ترخيص مصنع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND13-04.pdf |
| 1776 | طلب حماية أو دعم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476510/IND12-01.pdf |

### وزارة العمل (12)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1807 | التحقيق في الشكوى الجماعية المرفوعة مباشرة أمام وزارة العمل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB21-02.pdf |
| 1808 | التحقيق في الشكوى الفردية المرفوعة مباشرة أمام وزارة العمل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB21-01.pdf |
| 1811 | التصديق على النظام الداخلي لشركة أو مؤسسة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB22-01.pdf |
| 1813 | التصديق على دوام العمل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576166/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B5%D8%AF%D9%8A%D9%82%20%D8%B9%D9%84%D9%89%20%D8%AF%D9%88%D8%A7%D9%85%20%D8%B9%D9%85%D9%84.pdf |
| 1828 | طلب الحصول على إجازة عمل عامل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-06.pdf |
| 1830 | طلب الحصول على إجازة عمل عاملة أو عامل في الخدمة المنزلية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576166/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%AC%D8%A7%D8%B2%D8%A9%20%D8%B9%D9%85%D9%84.pdf |
| 1831 | طلب الحصول على إجازة عمل لرب العمل ( ممثل أو مدير شركة أجنبية ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-11.pdf |
| 1836 | طلب الحصول على تجديد إجازة عمل عامل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-07.pdf |
| 1838 | طلب الحصول على تجديد إجازة عمل لعامل زراعي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-09.pdf |
| 1840 | طلب الحصول على مساعدة اجتماعية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB14-01.pdf |
| 1845 | طلب الحصول على موافقة مسبقة لأصحاب العمل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-13.pdf |
| 1847 | طلب الحصول على موافقة مسبقة للأجراء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476596/LAB11-03.pdf |

### مؤسسة أليسار - سوليدير (8)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 223 | إفادة عن العقار الخاضع للضم و الفرز | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476368/ALYS1-01.pdf |
| 224 | إفادة عن العقار خارج نطاق &#034;مؤسسة أليسار&#034; | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476368/ALYS1-02.pdf |
| 225 | إفادة عن عقار مستملك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476368/ALYS1-04.pdf |
| 226 | إفادة عن عقار مصاب بتخطيط تنظيمي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476368/ALYS1-03.pdf |
| 230 | طلب الحصول على مساعدة مالية للمساهمة في استكمال بناء منشآت وتجهيزات خاصة بالنشاطات المرخص بها | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576170/%D8%B7%D9%84%D8%A8%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9%20%D9%85%D8%A7%D9%84%D9%8A%D8%A9%20%D9%84%D9%84%D9%85%D8%B3%D8%A7%D9%87%D9%85%D8%A9%20%D9%81%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%83%D9%85%D8%A7%D9%84%20%D8%A8%D9%86%D8%A7%D8%A1%20%D9%85%D9%86%D8%B4%D8%A2%D8%AA%20%D9%88%D8%AA%D8%AC%D9%87%D9%8A%D8%B2%D8%A7%D8%AA%20%D8%AE%D8%A7%D8%B5%D8%A9%20%D8%A8%D8%A7%D9%84%D9%86%D8%B4%D8%A7%D8%B7%D8%A7%D8%AA.pdf |
| 231 | طلب الحصول على مساعدة مالية للمساهمة في استكمال بناء منشآت وتجهيزات خاصة بالنشاطات المرخص بها. | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477594/YSP12-12.pdf |
| 232 | طلب الحصول على مساعدة مالية للمساهمة في نفقات الإعداد والتدريب والتحضير والتجهيز والمشاركة في تنفيذ نشاطات بالتعاون مع وزارة الشباب والرياضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477594/YSP11-13.pdf |
| 233 | طلب الحصول على مساعدة مالية للمساهمة في نفقات الإعداد والتدريب والتحضير والتجهيز والمشاركة للنشاطات المقررة من قبل وزارة الشباب والرياضة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477594/YSP11-14.pdf |

### المديرية العامة للتعاونيات (7)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 66 | إبداء رغبة بإعادة الانتساب | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP23-07.pdf |
| 72 | تقديم طلب مساعدة الأسنان | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP21-05.pdf |
| 74 | سلفة عن علاج في الخارج | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP21-04.pdf |
| 75 | سلفة عن علاج في الداخل | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP21-03.pdf |
| 76 | طلب انتساب إلى التعاونية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP23-08.pdf |
| 79 | مساعدة مرضية ( أسنان) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP21-02.pdf |
| 85 | موافقة على الاستشفاء | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476236/COOP22-01.pdf |

### بوابة دولتي - الخدمات الإلكترونية (6)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 96 | إعادة وصل التيار بعد دفع المخالفة أو دفع الفاتورة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-05.pdf |
| 98 | اشتراك جديد في أكواخ أو لوحات إعلانية بأملاك الدولة أو بالأملاك الخاصة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-15.pdf |
| 99 | اشتراك جديد في ارض زراعية - ري (أو بيت منفرد) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-14.pdf |
| 101 | اشتراك جديد لبناء في أملاك الغير أو المشاع | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-06.pdf |
| 105 | تقوية اشتراك عداد صاحب العلاقة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-11.pdf |
| 106 | ربط بناء جديد بالتيار الكهربائي (عداد ورشة) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476398/ELIB11-13.pdf |

### بوابة دولتي (4)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 88 | طلب الحصول على ترخيص لتعاطي مهنة تعهد استعمال الأدوية الزراعية (تعقيم التربة بالمواد الغازية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-01B-SP.pdf |
| 89 | طلب الحصول على ترخيص لتعاطي مهنة تعهد استعمال الأدوية الزراعية (تعقيم بالمواد الغازية للخشب ومواد التعبئة الخشبية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595588/AGR132-01A-SP.pdf |
| 90 | طلب الحصول على ترخيص لتعاطي مهنة تعهد استعمال الأدوية الزراعية (رش الأدوية الزراعية على الأشجار وفي الحقول) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/595586/AGR132-01C.pdf |
| 92 | ﻁﻠﺏ ﺍﻓﺎﺩﺓ ﺩﺧﻭﻝ ﻭﺧﺭﻭﺝ ﻟﺻﺎﺣﺏ ﺍﻟﻌﻼﻗﺔ ﺷﺧﺻﻳﺎ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/876678/FN_GENSEC207_1_1.pdf |

### سلطات المياه (4)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 185 | براءة ذمة مالية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/354575190/WATR1-03.pdf |
| 187 | شكوى إنقطاع المياه | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476272/WABE1-12.pdf |
| 192 | طلب إعادة اشتراك عادي | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476438/WATR1-07.pdf |
| 196 | طلب إفادة مشترك / غير مشترك | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476272/WABE1-10.pdf |

### سلطات المياه (المؤسسات العامة) (3)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 208 | طلب إيصال إستعمال لمياه بئر غير متفجرة (وجهة الإستعمال: سكني) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576150/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%8A%D8%B5%D8%A7%D9%84%20%D8%A5%D8%B3%D8%AA%D8%B9%D9%85%D8%A7%D9%84%20%D9%85%D9%8A%D8%A7%D9%87%20%D8%A8%D8%A6%D8%B1%20%D8%BA%D9%8A%D8%B1%20%D9%85%D8%AA%D9%81%D8%AC%D8%B1%D8%A9%20%D9%88%D8%AC%D9%87%D8%A9%20%D8%A7%D8%A5%D9%84%D8%B3%D8%AA%D8%B9%D9%85%D8%A7%D9%84%20%D8%B3%D9%83%D9%86%D9%8A.pdf |
| 209 | طلب إيصال علم وخبر لحفر بئر غير متفجرة¹ (وجهة الإستعمال: سياحي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576150/%D8%B7%D9%84%D8%A8%20%D8%A5%D9%8A%D8%B5%D8%A7%D9%84%20%D8%B9%D9%84%D9%85%20%D9%88%D8%AE%D8%A8%D8%B1%20%D9%84%D8%AD%D9%81%D8%B1%20%D8%A8%D8%A6%D8%B1%20%D8%BA%D9%8A%D8%B1%20%D9%85%D8%AA%D9%81%D8%AC%D8%B1%D8%A9%20%D9%88%D8%AC%D9%87%D8%A9%20%D8%A7%D8%A5%D9%84%D8%B3%D8%AA%D8%B9%D9%85%D8%A7%D9%84%20%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A.pdf |
| 211 | ملف فني لإنشاء مركز تخزين وتعبئة وتوزيع قوارير مادة غاز النفط المسيل/فئة ثانية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476966/PWA32-03.pdf |

### وزارة التهجير (3)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 972 | إعفاء من رسوم المياه والكهرباء،عملاً بقرار مجلس الوزراء رقم 6 تاريخ 21/07/1994 | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477398/DIS111-01.pdf |
| 973 | طلب اعتراض على الترميم | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477398/DIS111-02.pdf |
| 974 | طلب ترميم دور العبادة لقرى المصالحات فقط | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477398/DIS111-03.pdf |

### وزارة العدل (3)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1790 | تسجيل التجار ( اللبنانيون والأجانب ) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576163/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B3%D8%AC%D9%8A%D9%84%20%D8%AA%D8%A7%D8%AC%D8%B1%20%D9%84%D8%A8%D9%86%D8%A7%D9%86%D9%8A%20%D8%A3%D9%88%20%D8%A3%D8%AC%D9%86%D8%A8%D9%8A.pdf |
| 1794 | طلب اشتراك في مباراة الدخول إلى معهد الدروس القضائية ( قسم القضاء العدلي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576163/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9%20%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84%20%D8%A5%D9%84%D9%89%20%D9%85%D8%B9%D9%87%D8%AF%20%D8%A7%D9%84%D8%AF%D8%B1%D9%88%D8%B3%20%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A%D8%A9.pdf |
| 1795 | طلب اشتراك في مباراة لتعيين كتاب عدل متدرجين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576163/%D8%B7%D9%84%D8%A8%20%D8%A5%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%85%D8%A8%D8%A7%D8%B1%D8%A7%D8%A9%20%D9%84%D8%AA%D8%B9%D9%8A%D9%8A%D9%86%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%B9%D8%AF%D9%84%20%D9%85%D8%AA%D8%AF%D8%B1%D8%AC%D9%8A%D9%86.pdf |

### المديرية العامة للأمن العام (2)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 63 | ﺍﻓﺎﺩﺓ ﺑﺟﻭﺍﺯﺍﺕ ﺍﻟﺳﻔﺭ ﺍﻟﻣﻣﻧﻭﺣﺔ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/876678/FN_GENSEC212_1_1.pdf |
| 65 | ﺗﺻﺣﻳﺢ ﺳﻣﺔ ﺩﺧﻭﻝ &#x2013; ﺍﺳﻡ &#x2013; ﺭﻗﻡ ﺟﻭﺍﺯ ﺍﻟﺳﻔﺭ | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/876678/FN_GENSEC211_1_2.pdf |

### هيئة إدارة السير والآليات والمركبات (2)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 256 | امتحان سوق أو الحصول على رخصة سوق لأي فئة من الفئات المذكورة لاحقاً | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476342/TVMA2-05.pdf |
| 257 | بدل عن ضائع رخصة سوق | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476342/TVMA2-01.pdf |

### وزارة الأشغال العامة والنقل (2)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 280 | طلب تسجيل سفينة ( باخرة، مركب كبير، للملاحة البعيدة المدى..) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576177/%D8%B7%D9%84%D8%A8%20%D8%B1%D8%AE%D8%B5%D8%A9%20%D9%85%D8%A7%D9%84%D8%AD%D8%A9%20%D8%A3%D9%88%20%D8%B4%D9%87%D8%A7%D8%AF%D8%A9%20%D8%B3%D8%A7%D9%84%D9%85%D8%A9%20%D9%85%D8%A7%D9%84%D8%AD%D8%A9.pdf |
| 285 | طلب رخصة مزاولة أعمال الوكالة البحرية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576177/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D9%88%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF%20%D9%85%D8%B2%D8%A7%D9%88%D9%84%D8%A9%20%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D9%88%D9%83%D8%A7%D9%84%D8%A9%20%D8%A7%D9%84%D8%A8%D8%AD%D8%B1%D9%8A%D8%A9.pdf |

### وزارة الصحة العامة - السلامة (2)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 1757 | طلب رعاية اجتماعية للمسنين | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477406/SAF_141-02.pdf |
| 1758 | عقد مشترك للخدمات الاجتماعية بين وزارة الشؤون الاجتماعية والجمعيات والهيئات الأهلية (تعاقد جديد) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/477406/SAF121-01.pdf |

### وزارة المالية - الدوائر العقارية (2)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 2480 | معاملة قبض تعويض استملاك (حكم استئنافي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476332/CDRE1-01.pdf |
| 2481 | معاملة قبض تعويض استملاك (حكم بدائي) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476332/CDRE1-02.pdf |

### مؤسسة المقاييس والمواصفات (ليبنور) (1)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 235 | الحصول على ترخيص باستعمال شارة المطابقة | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476268/LIBN1-01.pdf |

### مرفأ بيروت (1)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 248 | معاملة تسديد الرسوم المتوجبة على الوكالات البحرية ( وكالات بحرية) ( الأنموذج 802 تذكرة الرسوم المتوجبة على الوكالات البحرية) | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476338/PBEI1-16.pdf |

### وزارة الأشغال - النقل البحري (1)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 270 | طلب رخصة متعهد تموين السفن بالمحروقات | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576177/%D8%B7%D9%84%D8%A8%20%D8%AA%D8%B1%D8%AE%D9%8A%D8%B5%20%D9%88%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF%20%D9%85%D8%B2%D8%A7%D9%88%D9%84%D8%A9%20%D8%AA%D9%85%D9%88%D9%8A%D9%86%20%D8%A7%D9%84%D8%B3%D9%81%D9%86%20%D8%A8%D8%A7%D9%84%D9%85%D8%AD%D8%B1%D9%88%D9%82%D8%A7%D8%AA%20%D8%B9%D9%86%20%D8%B7%D8%B1%D9%8A%D9%82%20%D8%A7%D9%84%D8%A8%D8%B1%20%20%D8%A7%D9%84%D8%A8%D8%AD%D8%B1.pdf |

### وزارة الإعلام (1)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 289 | الترخيص بإصدار مطبوعة دورية غير سياسية | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/576158/%D8%B7%D9%84%D8%A8%20%D8%B1%D8%AE%D8%B5%D8%A9%20%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1%20%D9%85%D8%B7%D8%A8%D9%88%D8%B9%D8%A9%20%D8%AF%D9%88%D8%B1%D9%8A%D8%A9%20%D8%BA%D9%8A%D8%B1%20%D8%B3%D9%8A%D8%A7%D8%B3%D9%8A%D8%A9.pdf |

### وزارة الثقافة - الكونسرفتوار (1)

| مفتاح _P | العنوان | الرابط المزوّر |
|---|---|---|
| 997 | تسجيل الطلاب في الكونسرفتوار | https://web.archive.org/web/2019id_/http://www.dawlati.gov.lb/documents/10180/476434/Cons1-01.pdf |
