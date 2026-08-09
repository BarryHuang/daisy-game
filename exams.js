// exams.js — 測驗題庫的學期登錄表
//
// 題庫是綁學期的：midterm_questions.js / final_questions.js 是一下（Spring
// 2025-2026）的範圍，二上會有自己的。這裡把它們掛到學期底下，讓舊的留著當
// 參考、但不再是預設。
//
// 學期代號沿用 words.js 的 CURRENT_TERM，不要另外發明一套。
//
// 二上要加的時候：
//   1. 新增 term2_1_questions.js（格式同現有題庫）
//   2. 在 EXAM_TERMS 加一組 "2-1"
//   3. words.js 的 CURRENT_TERM 改成 "2-1"
// 倉鼠頁不用改。

const EXAM_TERMS = {
  "1-2": {
    label: "一下",
    banks: [
      { key: "mid",   name: "期中", range: "Wk 1-8",
        get: () => (typeof midtermQuestions !== "undefined" ? midtermQuestions : []) },
      { key: "final", name: "期末", range: "Wk 10-16",
        get: () => (typeof finalQuestions !== "undefined" ? finalQuestions : []) }
    ]
  }
  // "2-1": { label:"二上", banks:[ {key:"mid", name:"期中", range:"…", get:()=>…} ] }
};

function examCurrentTerm() {
  const t = typeof CURRENT_TERM !== "undefined" ? CURRENT_TERM : null;
  return EXAM_TERMS[t] ? t : Object.keys(EXAM_TERMS).sort().pop();
}

/** 給 UI 用的選項清單。本學期的排前面，舊學期標上學期名。 */
function examOptions() {
  const cur = examCurrentTerm();
  const out = [];

  const push = (term, bank, isPast) => {
    const t = EXAM_TERMS[term];
    out.push({
      id: term + ":" + bank.key,
      name: bank.name,
      range: bank.range,
      term: term,
      termLabel: t.label,
      past: isPast,
      questions: bank.get()
    });
  };

  EXAM_TERMS[cur].banks.forEach((b) => push(cur, b, false));
  if (EXAM_TERMS[cur].banks.length > 1) {
    out.push({
      id: cur + ":all", name: "全部", range: "一起考",
      term: cur, termLabel: EXAM_TERMS[cur].label, past: false,
      questions: EXAM_TERMS[cur].banks.flatMap((b) => b.get())
    });
  }

  Object.keys(EXAM_TERMS).sort().reverse().forEach((term) => {
    if (term === cur) return;
    EXAM_TERMS[term].banks.forEach((b) => push(term, b, true));
  });

  return out.filter((o) => o.questions.length);
}

function examById(id) {
  return examOptions().find((o) => o.id === id) || examOptions()[0] || null;
}
