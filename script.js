 const list = [];

    function renderList() {
      const ul = document.getElementById('list');
      ul.innerHTML = '';

      list.forEach((task, i) => {
        const li = document.createElement('li');
        li.className = task.type;

        li.innerHTML = `
          <input class="task-text" type="text" value="${task.item}" onchange="editItem(${i}, this.value)">
          <div class="task-controls">
            <select onchange="editType(${i}, this.value)">
              <option value="high" ${task.type === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${task.type === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${task.type === 'low' ? 'selected' : ''}>Low</option>
            </select>
            <button onclick="remove(${i})">❌</button>
          </div>
        `;
        ul.appendChild(li);
      });
    }

    function add() {
      const item = document.getElementById('todo').value.trim();
      const type = document.getElementById('type').value;

      if (!item) return;

      list.push({ item, type });
      renderList();
      document.getElementById('todo').value = '';
    }

    function remove(index) {
      list.splice(index, 1);
      renderList();
    }

    function editItem(index, newValue) {
      list[index].item = newValue;
      renderList();
    }

    function editType(index, newType) {
      list[index].type = newType;
      renderList();
    }