/**
 * Modular Interactive Quiz Engine for IOI Ocean Academy BD
 * Supporting:
 * 1. Multiple Choice (MCQ) with rich explanations
 * 2. True / False interactive cards with detailed rationale
 * 3. Heading Matching (Drag-and-Drop & Tap/Select to match concepts with headings)
 * 4. Side / Pair Matching (Connecting organisms with oceanic depth zones)
 * 5. Comparison & Categorization (Sorting items into Benthic vs. Pelagic buckets)
 * 6. Passing Threshold calculation (>= 80% to unlock certification)
 * Styled with an elegant Light Theme (White & Ocean Blue)
 */

import { oceanAudio } from './audio.js';

export class QuizEngine {
  constructor(quizData, containerEl, onCompleteCallback) {
    this.quiz = quizData;
    this.container = containerEl;
    this.onComplete = onCompleteCallback;
    this.userAnswers = {};
    this.isSubmitted = false;
    this.scoreResult = null;

    // Track matching selections
    this.activeHeadingSelected = null;
    this.activePairSelected = null;
  }

  init() {
    this.userAnswers = {};
    this.isSubmitted = false;
    this.scoreResult = null;
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        <!-- Quiz Header Banner (Ocean Blue Gradient) -->
        <div class="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sky-100 text-xs font-semibold uppercase tracking-wider mb-2">
                <i data-lucide="award" class="w-3.5 h-3.5"></i> Final Certification Exam
              </div>
              <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight">${this.quiz.title}</h2>
              <p class="text-sky-100 text-sm mt-1">Passing threshold: <span class="text-amber-300 font-bold">${this.quiz.passingScore}%</span> required to unlock your verified IOI Academy Certificate.</p>
            </div>
            <div class="flex items-center gap-3 self-start md:self-auto">
              <div class="text-right">
                <div class="text-xs text-sky-200 font-medium">Questions</div>
                <div class="text-xl font-bold text-white">${this.quiz.questions.length} Modules</div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-lg shadow-inner">
                80%
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Container -->
        <div id="quiz-questions-list" class="space-y-6">
          ${this.quiz.questions.map((q, idx) => this.renderQuestionBlock(q, idx + 1)).join('')}
        </div>

        <!-- Quiz Submission Footer Action Bar -->
        <div class="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
            <span class="text-sm font-medium text-slate-700">Answer all questions thoroughly before finalizing.</span>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button id="btn-reset-quiz" type="button" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition flex items-center justify-center gap-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i> Reset
            </button>
            <button id="btn-submit-quiz" type="button" class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i> Submit &amp; Grade Examination
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
    if (window.lucide) {
      window.lucide.createIcons({ root: this.container });
    }
  }

  renderQuestionBlock(question, qNum) {
    return `
      <div class="quiz-question-card bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative transition-all duration-300" id="card-${question.id}">
        <div class="flex items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            ${question.title}
          </span>
          <span class="text-xs text-slate-500 font-semibold">${question.points} Points</span>
        </div>

        ${this.renderQuestionContent(question)}

        <!-- Feedback Box (Hidden until submit) -->
        <div id="feedback-${question.id}" class="mt-6 hidden transition-all duration-300"></div>
      </div>
    `;
  }

  renderQuestionContent(question) {
    switch (question.type) {
      case 'mcq':
        return this.renderMCQ(question);
      case 'true_false':
        return this.renderTrueFalse(question);
      case 'heading_match':
        return this.renderHeadingMatch(question);
      case 'pair_match':
        return this.renderPairMatch(question);
      case 'categorization':
        return this.renderCategorization(question);
      default:
        return `<p class="text-rose-600 font-medium">Unsupported question format.</p>`;
    }
  }

  // 1. Multiple Choice Renderer
  renderMCQ(q) {
    return `
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-slate-900 leading-snug">${q.prompt}</h3>
        <div class="grid grid-cols-1 gap-3">
          ${q.options.map((opt, i) => `
            <button type="button" 
              class="mcq-option-btn w-full text-left p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/80 hover:border-sky-300 text-slate-800 transition-all flex items-start gap-3.5 group cursor-pointer"
              data-qid="${q.id}" 
              data-optid="${opt.id}">
              <span class="w-6 h-6 rounded-full border border-slate-300 group-hover:border-sky-500 bg-white flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-sky-600 flex-shrink-0 mt-0.5 shadow-sm">
                ${String.fromCharCode(65 + i)}
              </span>
              <span class="text-sm font-medium leading-relaxed">${opt.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 2. True / False Renderer
  renderTrueFalse(q) {
    return `
      <div class="space-y-5">
        <div class="p-4 rounded-xl bg-sky-50/70 border border-sky-100">
          <p class="text-base text-slate-900 font-medium italic leading-relaxed">
            "${q.statement}"
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <button type="button" 
            class="tf-btn p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-800 transition font-bold text-center flex items-center justify-center gap-2 group cursor-pointer"
            data-qid="${q.id}" 
            data-value="true">
            <i data-lucide="check" class="w-5 h-5 text-emerald-600"></i>
            <span>TRUE</span>
          </button>
          <button type="button" 
            class="tf-btn p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:border-rose-400 hover:bg-rose-50/50 text-slate-800 transition font-bold text-center flex items-center justify-center gap-2 group cursor-pointer"
            data-qid="${q.id}" 
            data-value="false">
            <i data-lucide="x" class="w-5 h-5 text-rose-600"></i>
            <span>FALSE</span>
          </button>
        </div>
      </div>
    `;
  }

  // 3. Heading Matching Renderer (Drag-and-Drop & Tap-to-Match)
  renderHeadingMatch(q) {
    const shuffledHeadings = [...q.pairs].map(p => ({ id: p.id, heading: p.heading }))
      .sort(() => 0.5 - Math.random());

    return `
      <div class="space-y-5">
        <p class="text-sm text-slate-700 font-medium">${q.instruction}</p>
        <p class="text-xs text-sky-700 font-medium bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 inline-flex items-center gap-1.5">
          <i data-lucide="info" class="w-3.5 h-3.5 text-sky-600"></i>
          Tip: Click a concept on the left, then click its corresponding heading on the right (or drag-and-drop).
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="heading-match-grid-${q.id}">
          <!-- Left: Concept Descriptions -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Oceanographic Concept</h4>
            ${q.pairs.map(p => `
              <div class="concept-slot p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs leading-relaxed cursor-pointer transition select-none hover:border-sky-400 shadow-sm relative group"
                data-qid="${q.id}"
                data-conceptid="${p.id}"
                id="concept-${p.id}">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-medium">${p.concept}</p>
                  <span class="status-pill text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono flex-shrink-0">Unpaired</span>
                </div>
                <div class="matched-heading-tag mt-2 hidden text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded border border-sky-300 flex items-center justify-between">
                  <span class="tag-label"></span>
                  <button type="button" class="btn-clear-match text-slate-500 hover:text-rose-600 ml-2 font-bold text-sm">&times;</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right: Heading Labels -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Scientific Heading Bank</h4>
            ${shuffledHeadings.map(h => `
              <button type="button" 
                class="heading-bank-btn w-full p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-400 text-slate-800 text-sm font-semibold text-left transition select-none cursor-pointer flex items-center justify-between group shadow-sm"
                draggable="true"
                data-qid="${q.id}"
                data-headingid="${h.id}"
                data-headingtext="${h.heading}">
                <span>${h.heading}</span>
                <i data-lucide="grip-vertical" class="w-4 h-4 text-slate-400 group-hover:text-sky-600"></i>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 4. Side / Pair Matching (Organisms to Ocean Depth Zones)
  renderPairMatch(q) {
    const shuffledTargets = [...q.pairs].map(p => ({ id: p.id, match: p.match }))
      .sort(() => 0.5 - Math.random());

    return `
      <div class="space-y-5">
        <p class="text-sm text-slate-700 font-medium">${q.instruction}</p>
        <p class="text-xs text-sky-700 font-medium bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 inline-flex items-center gap-1.5">
          <i data-lucide="info" class="w-3.5 h-3.5 text-sky-600"></i>
          Select an organism on the left, then connect it to its depth zone on the right.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left: Organisms -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Marine Organism</h4>
            ${q.pairs.map(p => `
              <div class="organism-card p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-400 text-slate-800 text-sm font-medium transition cursor-pointer select-none shadow-sm"
                data-qid="${q.id}"
                data-pairid="${p.id}"
                id="pair-org-${p.id}">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-900">${p.item}</span>
                  <span class="pair-status text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">Select</span>
                </div>
                <div class="connected-zone-badge mt-2 hidden text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded border border-sky-300 flex items-center justify-between">
                  <span class="zone-name"></span>
                  <button type="button" class="btn-clear-pair text-slate-500 hover:text-rose-600 ml-2 font-bold text-sm">&times;</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Right: Ocean Zones -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Ocean Depth Zone</h4>
            ${shuffledTargets.map(t => `
              <button type="button" 
                class="zone-btn w-full p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-400 text-slate-800 text-sm font-medium text-left transition select-none cursor-pointer flex items-center justify-between group shadow-sm"
                data-qid="${q.id}"
                data-targetid="${t.id}"
                data-targettext="${t.match}">
                <span>${t.match}</span>
                <i data-lucide="link" class="w-4 h-4 text-slate-400 group-hover:text-sky-600"></i>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 5. Comparison & Categorization (Sorting / Bucket Drop)
  renderCategorization(q) {
    const shuffledItems = [...q.items].sort(() => 0.5 - Math.random());

    return `
      <div class="space-y-6">
        <p class="text-sm text-slate-700 font-medium">${q.instruction}</p>
        
        <!-- Unassigned Items Tray -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-600">Marine Specimen Tray (Click or Drag to assign)</span>
            <span id="unassigned-count-${q.id}" class="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              ${shuffledItems.length} Remaining
            </span>
          </div>
          <div class="flex flex-wrap gap-2.5 min-h-[52px]" id="specimen-tray-${q.id}">
            ${shuffledItems.map(item => `
              <div class="specimen-tag px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold cursor-grab active:cursor-grabbing hover:border-sky-400 hover:bg-sky-50 transition flex items-center gap-2 select-none shadow-sm"
                draggable="true"
                data-qid="${q.id}"
                data-itemid="${item.id}"
                data-correctcat="${item.categoryId}"
                id="item-${item.id}">
                <i data-lucide="fish" class="w-3.5 h-3.5 text-sky-600"></i>
                <span>${item.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Category Drop Buckets -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${q.categories.map(cat => `
            <div class="category-bucket rounded-xl p-5 border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 hover:border-sky-500 transition-all flex flex-col min-h-[160px]"
              data-qid="${q.id}"
              data-catid="${cat.id}"
              id="bucket-${cat.id}">
              <div class="flex items-center justify-between border-b border-sky-200 pb-2.5 mb-3">
                <span class="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <i data-lucide="${cat.id === 'cat_benthic' ? 'anchor' : 'waves'}" class="w-4 h-4 text-sky-600"></i>
                  ${cat.name}
                </span>
                <span class="bucket-count text-xs font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">0 items</span>
              </div>
              <div class="bucket-slots flex-1 flex flex-wrap gap-2 content-start">
                <!-- Dropped items appear here -->
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Event Attachments
  attachEvents() {
    this.quiz.questions.forEach(q => {
      if (q.type === 'mcq') this.attachMCQEvents(q);
      else if (q.type === 'true_false') this.attachTFEvents(q);
      else if (q.type === 'heading_match') this.attachHeadingMatchEvents(q);
      else if (q.type === 'pair_match') this.attachPairMatchEvents(q);
      else if (q.type === 'categorization') this.attachCategorizationEvents(q);
    });

    // Reset button
    const btnReset = this.container.querySelector('#btn-reset-quiz');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        oceanAudio.playClick();
        if (confirm('Are you sure you want to reset all answers for this quiz?')) {
          this.init();
        }
      });
    }

    // Submit button
    const btnSubmit = this.container.querySelector('#btn-submit-quiz');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        this.submitQuiz();
      });
    }
  }

  attachMCQEvents(q) {
    const buttons = this.container.querySelectorAll(`.mcq-option-btn[data-qid="${q.id}"]`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isSubmitted) return;
        oceanAudio.playClick();
        buttons.forEach(b => {
          b.classList.remove('border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500/30');
        });
        btn.classList.add('border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500/30');
        this.userAnswers[q.id] = btn.dataset.optid;
      });
    });
  }

  attachTFEvents(q) {
    const buttons = this.container.querySelectorAll(`.tf-btn[data-qid="${q.id}"]`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isSubmitted) return;
        oceanAudio.playClick();
        buttons.forEach(b => {
          b.classList.remove('border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500/30');
        });
        btn.classList.add('border-sky-500', 'bg-sky-50', 'ring-2', 'ring-sky-500/30');
        this.userAnswers[q.id] = btn.dataset.value === 'true';
      });
    });
  }

  attachHeadingMatchEvents(q) {
    this.userAnswers[q.id] = this.userAnswers[q.id] || {};
    const conceptSlots = this.container.querySelectorAll(`.concept-slot[data-qid="${q.id}"]`);
    const headingButtons = this.container.querySelectorAll(`.heading-bank-btn[data-qid="${q.id}"]`);

    conceptSlots.forEach(slot => {
      slot.addEventListener('click', (e) => {
        if (this.isSubmitted) return;
        if (e.target.classList.contains('btn-clear-match')) {
          const cid = slot.dataset.conceptid;
          delete this.userAnswers[q.id][cid];
          slot.querySelector('.matched-heading-tag').classList.add('hidden');
          slot.querySelector('.status-pill').textContent = 'Unpaired';
          slot.querySelector('.status-pill').classList.remove('bg-sky-100', 'text-sky-800');
          oceanAudio.playClick();
          return;
        }

        conceptSlots.forEach(s => s.classList.remove('ring-2', 'ring-sky-500', 'border-sky-500'));
        slot.classList.add('ring-2', 'ring-sky-500', 'border-sky-500');
        this.activeHeadingSelected = slot.dataset.conceptid;
        oceanAudio.playClick();
      });
    });

    headingButtons.forEach(hBtn => {
      hBtn.addEventListener('click', () => {
        if (this.isSubmitted) return;
        if (!this.activeHeadingSelected) {
          alert('Please select a concept on the left first!');
          return;
        }

        const conceptId = this.activeHeadingSelected;
        const headingId = hBtn.dataset.headingid;
        const headingText = hBtn.dataset.headingtext;

        this.userAnswers[q.id][conceptId] = headingId;

        const slot = this.container.querySelector(`#concept-${conceptId}`);
        if (slot) {
          const tag = slot.querySelector('.matched-heading-tag');
          tag.querySelector('.tag-label').textContent = headingText;
          tag.classList.remove('hidden');

          const pill = slot.querySelector('.status-pill');
          pill.textContent = 'Paired';
          pill.classList.add('bg-sky-100', 'text-sky-800');
        }

        oceanAudio.playClick();
      });

      hBtn.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          headingId: hBtn.dataset.headingid,
          headingText: hBtn.dataset.headingtext
        }));
      });
    });

    conceptSlots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('border-sky-500', 'bg-sky-50/50');
      });
      slot.addEventListener('dragleave', () => {
        slot.classList.remove('border-sky-500', 'bg-sky-50/50');
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('border-sky-500', 'bg-sky-50/50');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          const conceptId = slot.dataset.conceptid;
          this.userAnswers[q.id][conceptId] = data.headingId;

          const tag = slot.querySelector('.matched-heading-tag');
          tag.querySelector('.tag-label').textContent = data.headingText;
          tag.classList.remove('hidden');

          const pill = slot.querySelector('.status-pill');
          pill.textContent = 'Paired';
          pill.classList.add('bg-sky-100', 'text-sky-800');
          oceanAudio.playClick();
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  attachPairMatchEvents(q) {
    this.userAnswers[q.id] = this.userAnswers[q.id] || {};
    const orgCards = this.container.querySelectorAll(`.organism-card[data-qid="${q.id}"]`);
    const zoneButtons = this.container.querySelectorAll(`.zone-btn[data-qid="${q.id}"]`);

    orgCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (this.isSubmitted) return;
        if (e.target.classList.contains('btn-clear-pair')) {
          const pid = card.dataset.pairid;
          delete this.userAnswers[q.id][pid];
          card.querySelector('.connected-zone-badge').classList.add('hidden');
          card.querySelector('.pair-status').textContent = 'Select';
          card.querySelector('.pair-status').classList.remove('bg-sky-100', 'text-sky-800');
          oceanAudio.playClick();
          return;
        }

        orgCards.forEach(c => c.classList.remove('ring-2', 'ring-sky-500', 'border-sky-500'));
        card.classList.add('ring-2', 'ring-sky-500', 'border-sky-500');
        this.activePairSelected = card.dataset.pairid;
        oceanAudio.playClick();
      });
    });

    zoneButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isSubmitted) return;
        if (!this.activePairSelected) {
          alert('Select a marine organism on the left first!');
          return;
        }

        const pairId = this.activePairSelected;
        const targetId = btn.dataset.targetid;
        const targetText = btn.dataset.targettext;

        this.userAnswers[q.id][pairId] = targetId;

        const card = this.container.querySelector(`#pair-org-${pairId}`);
        if (card) {
          const badge = card.querySelector('.connected-zone-badge');
          badge.querySelector('.zone-name').textContent = targetText;
          badge.classList.remove('hidden');

          const status = card.querySelector('.pair-status');
          status.textContent = 'Linked';
          status.classList.add('bg-sky-100', 'text-sky-800');
        }

        oceanAudio.playClick();
      });
    });
  }

  attachCategorizationEvents(q) {
    this.userAnswers[q.id] = this.userAnswers[q.id] || {};
    const specimens = this.container.querySelectorAll(`.specimen-tag[data-qid="${q.id}"]`);
    const buckets = this.container.querySelectorAll(`.category-bucket[data-qid="${q.id}"]`);

    let activeSpecimen = null;

    specimens.forEach(tag => {
      tag.addEventListener('click', () => {
        if (this.isSubmitted) return;
        specimens.forEach(s => s.classList.remove('ring-2', 'ring-sky-500', 'border-sky-500'));
        tag.classList.add('ring-2', 'ring-sky-500', 'border-sky-500');
        activeSpecimen = tag;
        oceanAudio.playClick();
      });

      tag.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', tag.dataset.itemid);
      });
    });

    buckets.forEach(bucket => {
      bucket.addEventListener('click', (e) => {
        if (this.isSubmitted) return;
        if (!activeSpecimen) return;

        const catId = bucket.dataset.catid;
        const itemId = activeSpecimen.dataset.itemid;
        this.userAnswers[q.id][itemId] = catId;

        const slot = bucket.querySelector('.bucket-slots');
        slot.appendChild(activeSpecimen);
        activeSpecimen.classList.remove('ring-2', 'ring-sky-500', 'border-sky-500');
        activeSpecimen = null;

        this.updateBucketCounts(q);
        oceanAudio.playClick();
      });

      bucket.addEventListener('dragover', (e) => {
        e.preventDefault();
        bucket.classList.add('border-sky-500', 'bg-sky-100/50');
      });

      bucket.addEventListener('dragleave', () => {
        bucket.classList.remove('border-sky-500', 'bg-sky-100/50');
      });

      bucket.addEventListener('drop', (e) => {
        e.preventDefault();
        bucket.classList.remove('border-sky-500', 'bg-sky-100/50');
        const itemId = e.dataTransfer.getData('text/plain');
        const tag = this.container.querySelector(`#item-${itemId}`);
        if (tag) {
          const catId = bucket.dataset.catid;
          this.userAnswers[q.id][itemId] = catId;
          bucket.querySelector('.bucket-slots').appendChild(tag);
          this.updateBucketCounts(q);
          oceanAudio.playClick();
        }
      });
    });
  }

  updateBucketCounts(q) {
    const buckets = this.container.querySelectorAll(`.category-bucket[data-qid="${q.id}"]`);
    buckets.forEach(b => {
      const count = b.querySelectorAll('.specimen-tag').length;
      b.querySelector('.bucket-count').textContent = `${count} items`;
    });

    const tray = this.container.querySelector(`#specimen-tray-${q.id}`);
    const remaining = tray.querySelectorAll('.specimen-tag').length;
    const badge = this.container.querySelector(`#unassigned-count-${q.id}`);
    if (badge) {
      badge.textContent = `${remaining} Remaining`;
    }
  }

  submitQuiz() {
    let earnedPoints = 0;
    const totalPoints = this.quiz.totalPoints || 100;
    const breakdown = {};

    this.quiz.questions.forEach(q => {
      let isCorrect = false;
      let qPoints = 0;

      if (q.type === 'mcq') {
        const selectedOpt = this.userAnswers[q.id];
        const correctOpt = q.options.find(o => o.isCorrect);
        isCorrect = selectedOpt === correctOpt.id;
        qPoints = isCorrect ? q.points : 0;
      } 
      else if (q.type === 'true_false') {
        const ans = this.userAnswers[q.id];
        isCorrect = ans === q.isTrue;
        qPoints = isCorrect ? q.points : 0;
      }
      else if (q.type === 'heading_match') {
        const matches = this.userAnswers[q.id] || {};
        let correctCount = 0;
        q.pairs.forEach(p => {
          if (matches[p.id] === p.id) {
            correctCount++;
          }
        });
        isCorrect = correctCount === q.pairs.length;
        qPoints = Math.round((correctCount / q.pairs.length) * q.points);
      }
      else if (q.type === 'pair_match') {
        const matches = this.userAnswers[q.id] || {};
        let correctCount = 0;
        q.pairs.forEach(p => {
          if (matches[p.id] === p.id) {
            correctCount++;
          }
        });
        isCorrect = correctCount === q.pairs.length;
        qPoints = Math.round((correctCount / q.pairs.length) * q.points);
      }
      else if (q.type === 'categorization') {
        const cats = this.userAnswers[q.id] || {};
        let correctCount = 0;
        q.items.forEach(item => {
          if (cats[item.id] === item.categoryId) {
            correctCount++;
          }
        });
        isCorrect = correctCount === q.items.length;
        qPoints = Math.round((correctCount / q.items.length) * q.points);
      }

      earnedPoints += qPoints;
      breakdown[q.id] = { isCorrect, earnedPoints: qPoints, maxPoints: q.points };
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = percentage >= this.quiz.passingScore;

    this.isSubmitted = true;
    this.scoreResult = {
      earnedPoints,
      totalPoints,
      percentage,
      passed,
      breakdown,
      timestamp: new Date().toISOString()
    };

    if (passed) {
      oceanAudio.playCelebration();
      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } else {
      oceanAudio.playIncorrect();
    }

    this.renderFeedback(this.scoreResult);

    if (this.onComplete) {
      this.onComplete(this.scoreResult);
    }
  }

  renderFeedback(result) {
    this.quiz.questions.forEach(q => {
      const fbBox = this.container.querySelector(`#feedback-${q.id}`);
      const card = this.container.querySelector(`#card-${q.id}`);
      if (!fbBox) return;

      const qResult = result.breakdown[q.id];
      fbBox.classList.remove('hidden');

      if (qResult.isCorrect) {
        card.classList.add('border-emerald-300', 'bg-emerald-50/20');
      } else {
        card.classList.add('border-rose-300', 'bg-rose-50/20');
      }

      let explanationHtml = '';
      if (q.type === 'mcq') {
        const correctChoice = q.options.find(o => o.isCorrect);
        explanationHtml = `
          <div class="p-4 rounded-xl ${qResult.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}">
            <div class="flex items-center gap-2 font-bold ${qResult.isCorrect ? 'text-emerald-800' : 'text-rose-800'} mb-1 text-sm">
              <i data-lucide="${qResult.isCorrect ? 'check-circle' : 'alert-circle'}" class="w-4 h-4"></i>
              ${qResult.isCorrect ? 'Correct! (+20 Points)' : 'Incorrect (0 Points)'}
            </div>
            <p class="text-xs text-slate-700 mt-2 leading-relaxed">
              <strong class="text-emerald-800">Scientific Rationale:</strong> ${correctChoice.explanation}
            </p>
          </div>
        `;
      } else if (q.type === 'true_false') {
        explanationHtml = `
          <div class="p-4 rounded-xl ${qResult.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}">
            <div class="flex items-center gap-2 font-bold ${qResult.isCorrect ? 'text-emerald-800' : 'text-rose-800'} mb-1 text-sm">
              <i data-lucide="${qResult.isCorrect ? 'check-circle' : 'alert-circle'}" class="w-4 h-4"></i>
              ${qResult.isCorrect ? 'Correct! (+20 Points)' : 'Incorrect (0 Points)'}
            </div>
            <p class="text-xs text-slate-700 mt-2 leading-relaxed">
              <strong class="text-sky-800">Oceanographic Fact:</strong> ${q.explanation}
            </p>
          </div>
        `;
      } else if (q.type === 'heading_match') {
        explanationHtml = `
          <div class="p-4 rounded-xl ${qResult.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}">
            <div class="font-bold text-sm ${qResult.isCorrect ? 'text-emerald-800' : 'text-amber-800'} mb-2">
              Match Accuracy: ${qResult.earnedPoints} / ${q.points} Points
            </div>
            <ul class="text-xs space-y-1.5 text-slate-700">
              ${q.pairs.map(p => `
                <li class="flex items-center justify-between">
                  <span class="text-slate-600">${p.concept.substring(0, 50)}...</span>
                  <span class="font-bold text-sky-800">➡️ ${p.heading}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      } else if (q.type === 'pair_match') {
        explanationHtml = `
          <div class="p-4 rounded-xl ${qResult.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}">
            <div class="font-bold text-sm ${qResult.isCorrect ? 'text-emerald-800' : 'text-amber-800'} mb-2">
              Depth Stratification Matches: ${qResult.earnedPoints} / ${q.points} Points
            </div>
            <ul class="text-xs space-y-1.5 text-slate-700">
              ${q.pairs.map(p => `
                <li><strong>${p.item}:</strong> <span class="text-sky-800 font-semibold">${p.match}</span> (${p.info})</li>
              `).join('')}
            </ul>
          </div>
        `;
      } else if (q.type === 'categorization') {
        explanationHtml = `
          <div class="p-4 rounded-xl ${qResult.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}">
            <div class="font-bold text-sm ${qResult.isCorrect ? 'text-emerald-800' : 'text-amber-800'} mb-2">
              Categorization Score: ${qResult.earnedPoints} / ${q.points} Points
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 mt-2">
              ${q.items.map(item => `
                <div class="bg-white p-2 rounded border border-slate-200">
                  <span class="font-bold text-sky-800">${item.name}</span>: 
                  <span class="text-slate-600">${item.categoryId === 'cat_benthic' ? 'Benthic' : 'Pelagic'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      fbBox.innerHTML = explanationHtml;
    });

    window.scrollTo({ top: this.container.offsetTop - 50, behavior: 'smooth' });
    if (window.lucide) {
      window.lucide.createIcons({ root: this.container });
    }
  }
}
