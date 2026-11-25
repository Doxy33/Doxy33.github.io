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
