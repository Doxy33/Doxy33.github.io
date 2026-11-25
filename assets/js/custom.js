document.addEventListener('DOMContentLoaded', function () {

  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const hint = document.getElementById('formHint');
  const results = document.getElementById('formResults');

  const phoneInput = form.telefonas;
  const sliders = form.querySelectorAll('input[type="range"]');

  const fields = [form.vardas, form.pavarde, form.email, form.telefonas, form.adresas];

  const touched = new Set();

  const lettersOnly = /^\p{L}+$/u;
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneFormat = /^\+370 6\d{2} \d{5}$/;

  function getError(field) {
    const value = field.value.trim();

    if (value === '' || (field === phoneInput && value === '+370')) {
      return 'Šis laukas privalomas.';
    }

    switch (field.name) {
      case 'vardas':
      case 'pavarde':
        if (!lettersOnly.test(value)) {
          return 'Galima naudoti tik raides.';
        }
        break;

      case 'email':
        if (!emailFormat.test(value)) {
          return 'Neteisingas el. pašto formatas (pvz. vardas@pastas.lt).';
        }
        break;

      case 'telefonas':
        if (!phoneFormat.test(value)) {
          return 'Įveskite visą numerį formatu +370 6xx xxxxx.';
        }
        break;
    }
    return '';
  }

  function getRatingError(slider) {
    const value = Number(slider.value);
    if (!Number.isInteger(value) || value < 1 || value > 10) {
      return 'Įvertinimas turi būti nuo 1 iki 10.';
    }
    return '';
  }

  function showError(field, message) {
    const errorEl = document.getElementById(field.id + '-error');
    const show = message !== '' && touched.has(field);

    field.classList.toggle('is-invalid-field', show);
    field.classList.toggle('is-valid-field', touched.has(field) && message === '');
    field.setAttribute('aria-invalid', show ? 'true' : 'false');
    if (errorEl) errorEl.textContent = show ? message : '';
  }

  function validateForm() {
    let hasErrors = false;

    fields.forEach(function (field) {
      const message = getError(field);
      if (message) hasErrors = true;
      showError(field, message);
    });

    sliders.forEach(function (slider) {
      const message = getRatingError(slider);
      if (message) hasErrors = true;
      touched.add(slider);
      showError(slider, message);
    });

    submitBtn.disabled = hasErrors;
    hint.textContent = hasErrors
      ? 'Užpildykite visus privalomus laukus (*) teisingai, kad galėtumėte siųsti.'
      : 'Visi laukai užpildyti teisingai. Galite siųsti!';
    hint.classList.toggle('ready', !hasErrors);

    return !hasErrors;
  }

  fields.forEach(function (field) {
    field.addEventListener('input', function () {
      touched.add(field);
      validateForm();
    });
    field.addEventListener('blur', function () {
      touched.add(field);
      validateForm();
    });
  });

  phoneInput.setAttribute('maxlength', '14');

  function formatPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, '');

    if (digits.startsWith('370')) digits = digits.slice(3);
    if (digits.startsWith('370')) digits = digits.slice(3);
    if (digits.startsWith('8')) digits = digits.slice(1);

    digits = digits.slice(0, 8);

    let formatted = '+370 ' + digits.slice(0, 3);
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3);
    }
    return formatted;
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  phoneInput.addEventListener('focus', function () {
    if (phoneInput.value === '') phoneInput.value = '+370 ';
  });

  phoneInput.addEventListener('blur', function () {
    if (phoneInput.value.trim() === '+370') phoneInput.value = '';
    validateForm();
  });

  phoneInput.addEventListener('keydown', function (event) {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  });

  function updateSlider(slider) {
    const output = form.querySelector('output[for="' + slider.id + '"]');
    output.textContent = slider.value;
    const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.setProperty('--fill', percent + '%');
  }

  sliders.forEach(function (slider) {
    slider.addEventListener('input', function () {
      updateSlider(slider);
      validateForm();
    });
    updateSlider(slider);
  });

  validateForm();

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    fields.forEach(function (field) { touched.add(field); });
    if (!validateForm()) return;

    const formData = {
      vardas: form.vardas.value.trim(),
      pavarde: form.pavarde.value.trim(),
      email: form.email.value.trim(),
      telefonas: form.telefonas.value.trim(),
      adresas: form.adresas.value.trim(),
      klausimas1: Number(form.q1.value),
      klausimas2: Number(form.q2.value),
      klausimas3: Number(form.q3.value)
    };

    console.log(formData);

    const vidurkis = (formData.klausimas1 + formData.klausimas2 + formData.klausimas3) / 3;
    showResults(formData, vidurkis);
  });

  function addLine(label, value) {
    const line = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    line.appendChild(strong);
    line.appendChild(value instanceof Node ? value : document.createTextNode(value));
    results.appendChild(line);
  }

  function showResults(data, vidurkis) {
    results.innerHTML = '';

    const title = document.createElement('h4');
    title.textContent = 'Pateikti duomenys';
    results.appendChild(title);

    addLine('Vardas', data.vardas);
    addLine('Pavardė', data.pavarde);

    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:' + data.email;
    emailLink.textContent = data.email;
    addLine('El. paštas', emailLink);

    addLine('Tel. Numeris', data.telefonas);
    addLine('Adresas', data.adresas);
    addLine('Dizaino įvertinimas', data.klausimas1);
    addLine('Turinio įvertinimas', data.klausimas2);
    addLine('Rekomendacija', data.klausimas3);

    const average = document.createElement('p');
    average.className = 'form-average';
    average.textContent = data.vardas + ' ' + data.pavarde + ': ' + vidurkis.toFixed(1);
    results.appendChild(average);

    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  clearBtn.addEventListener('click', function () {
    form.reset();

    touched.clear();
    fields.forEach(function (field) {
      field.classList.remove('is-invalid-field', 'is-valid-field');
    });

    sliders.forEach(updateSlider);

    results.innerHTML = '';
    results.hidden = true;

    validateForm();
    form.vardas.focus();
  });

});

document.addEventListener('DOMContentLoaded', function () {

  const module = document.getElementById('skill-progress');
  if (!module) return;

  const STORAGE_KEY = 'skillKanban';

  const STATUSES = ['Planuojama', 'Mokomasi', 'Atlikta'];

  const initialSkills = [
    { name: 'React', status: 'Planuojama', xp: 30, icon: 'bi-filetype-jsx' },
    { name: 'SQL duomenų bazės', status: 'Planuojama', xp: 20, icon: 'bi-database' },
    { name: 'JavaScript', status: 'Mokomasi', xp: 80, icon: 'bi-filetype-js' },
    { name: 'Bootstrap 5', status: 'Mokomasi', xp: 45, icon: 'bi-bootstrap' },
    { name: 'HTML5', status: 'Atlikta', xp: 60, icon: 'bi-filetype-html' },
    { name: 'CSS3', status: 'Atlikta', xp: 70, icon: 'bi-filetype-css' },
    { name: 'Git ir GitHub', status: 'Atlikta', xp: 50, icon: 'bi-git' },
    { name: 'Responsive dizainas', status: 'Atlikta', xp: 35, icon: 'bi-phone' }
  ];

  const levels = [
    { level: 1, min: 0, rank: 'Pradedantysis' },
    { level: 2, min: 50, rank: 'Praktikantas' },
    { level: 3, min: 150, rank: 'Specialistas' },
    { level: 4, min: 300, rank: 'Profesionalas' }
  ];

  const columns = {
    'Planuojama': { list: document.getElementById('listPlanned'), count: document.getElementById('countPlanned'), css: 'status-planned' },
    'Mokomasi': { list: document.getElementById('listLearning'), count: document.getElementById('countLearning'), css: 'status-learning' },
    'Atlikta': { list: document.getElementById('listDone'), count: document.getElementById('countDone'), css: 'status-done' }
  };

  let skills = loadSkills();


  function loadSkills() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === initialSkills.length) {
        return initialSkills.map(function (skill) {
          const found = saved.find(function (s) { return s.name === skill.name; });
          const status = found && STATUSES.includes(found.status) ? found.status : skill.status;
          return Object.assign({}, skill, { status: status });
        });
      }
    } catch (error) {
      console.warn('Nepavyko nuskaityti išsaugotų duomenų', error);
    }
    return initialSkills.map(function (skill) { return Object.assign({}, skill); });
  }

  function saveSkills() {
    try {
      const data = skills.map(function (skill) {
        return { name: skill.name, status: skill.status };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Nepavyko išsaugoti duomenų', error);
    }
  }


  function createSkillCard(skill, index) {
    const card = document.createElement('article');
    card.className = 'skill-card';

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.innerHTML = '<i class="bi ' + skill.icon + '"></i>';

    const body = document.createElement('div');
    body.className = 'skill-body';

    const name = document.createElement('h4');
    name.className = 'skill-name';
    name.textContent = skill.name;

    const meta = document.createElement('div');
    meta.className = 'skill-meta';

    const select = document.createElement('select');
    select.className = 'skill-status skill-select ' + columns[skill.status].css;
    select.setAttribute('aria-label', 'Keisti įgūdžio „' + skill.name + '“ būseną');
    STATUSES.forEach(function (status) {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status;
      option.selected = status === skill.status;
      select.appendChild(option);
    });
    select.addEventListener('change', function () {
      changeStatus(index, select.value);
    });

    const xp = document.createElement('span');
    xp.className = 'skill-xp';
    xp.textContent = (skill.status === 'Atlikta' ? '' : '+') + skill.xp + ' XP';

    meta.appendChild(select);
    meta.appendChild(xp);
    body.appendChild(name);
    body.appendChild(meta);
    card.appendChild(icon);
    card.appendChild(body);

    return card;
  }

  function renderSkills(movedIndex) {
    STATUSES.forEach(function (status) {
      columns[status].list.innerHTML = '';
    });

    skills.forEach(function (skill, index) {
      const card = createSkillCard(skill, index);
      if (index === movedIndex) card.classList.add('just-moved');
      columns[skill.status].list.appendChild(card);
    });

    STATUSES.forEach(function (status) {
      const column = columns[status];
      const amount = column.list.children.length;
      column.count.textContent = amount;

      if (amount === 0) {
        const empty = document.createElement('p');
        empty.className = 'kanban-empty';
        empty.textContent = 'Nėra įgūdžių';
        column.list.appendChild(empty);
      }
    });
  }


  function calculateXP() {
    return skills
      .filter(function (skill) { return skill.status === 'Atlikta'; })
      .reduce(function (sum, skill) { return sum + skill.xp; }, 0);
  }

  function getLevel(xp) {
    let current = levels[0];
    levels.forEach(function (level) {
      if (xp >= level.min) current = level;
    });
    return current;
  }

  function updatePlayerInfo(xp, level) {
    document.getElementById('xpTotal').textContent = xp;
    document.getElementById('levelNum').textContent = level.level;
    document.getElementById('rankName').textContent = level.rank;

    const path = document.getElementById('rankPath');
    path.innerHTML = '';
    levels.forEach(function (item, i) {
      const step = document.createElement('li');
      let state = 'locked';
      if (item.level < level.level) state = 'reached';
      if (item.level === level.level) state = 'current';
      step.className = 'rank-step ' + state;

      const next = levels[i + 1];
      const range = next ? item.min + '–' + (next.min - 1) + ' XP' : '≥' + item.min + ' XP';
      const dot = state === 'locked' ? '<i class="bi bi-lock-fill"></i>' : item.level;

      step.innerHTML =
        '<span class="rank-dot">' + dot + '</span>' +
        '<span class="rank-name">' + item.rank + '</span>' +
        '<span class="rank-range">' + range + '</span>';
      path.appendChild(step);
    });
    path.style.setProperty('--path', ((level.level - 1) / (levels.length - 1) * 100) + '%');
  }

  function updateProgressBar(xp, level) {
    const next = levels.find(function (item) { return item.level === level.level + 1; });
    let percent;

    if (next) {
      percent = (xp - level.min) / (next.min - level.min) * 100;
      document.getElementById('xpBarText').textContent = xp + ' / ' + next.min + ' XP';
      document.getElementById('xpLeft').innerHTML =
        '<i class="bi bi-arrow-up-circle"></i> Iki <strong>' + next.level + ' lygio</strong> liko ' + (next.min - xp) + ' XP';
      document.getElementById('nextRank').innerHTML = 'Kitas rangas: <strong>' + next.rank + '</strong>';
    } else {
      percent = 100;
      document.getElementById('xpBarText').textContent = xp + ' XP · MAX';
      document.getElementById('xpLeft').innerHTML = '<i class="bi bi-stars"></i> Pasiektas <strong>maksimalus lygis</strong>';
      document.getElementById('nextRank').innerHTML = 'Rangas: <strong>' + level.rank + '</strong>';
    }

    percent = Math.max(0, Math.min(100, percent));
    document.getElementById('xpBarFill').style.width = percent + '%';
    document.getElementById('xpBar').setAttribute('aria-valuenow', Math.round(percent));
  }

  function updateStats() {
    const total = skills.length;
    const done = skills.filter(function (skill) { return skill.status === 'Atlikta'; }).length;
    const percent = total === 0 ? 0 : Math.round(done / total * 100);

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statPercent').textContent = percent + '%';
    document.getElementById('statRingText').textContent = percent + '%';
    document.getElementById('statRing').style.setProperty('--p', percent);
  }


  function updateModule(movedIndex) {
    renderSkills(movedIndex);
    const xp = calculateXP();
    const level = getLevel(xp);
    updatePlayerInfo(xp, level);
    updateProgressBar(xp, level);
    updateStats();
  }

  function changeStatus(index, newStatus) {
    if (!STATUSES.includes(newStatus)) return;
    skills[index].status = newStatus;
    saveSkills();
    updateModule(index);
  }

  updateModule();

});
