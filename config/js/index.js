// API Base URL - Update this to match your API URL
const API_BASE_URL = "https://api-gerenciador-qqy9.onrender.com";

// DOM Elements
const usersTab = document.getElementById("usersTab");
const addUserTab = document.getElementById("addUserTab");
const usersTabBtn = document.getElementById("usersTabBtn");
const addUserTabBtn = document.getElementById("addUserTabBtn");
const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");
const addUserForm = document.getElementById("addUserForm");
const cancelAddUserBtn = document.getElementById("cancelAddUserBtn");
const editUserModal = document.getElementById("editUserModal");
const editUserForm = document.getElementById("editUserForm");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Tab switching
usersTabBtn.addEventListener("click", () => {
  usersTab.classList.remove("hidden");
  addUserTab.classList.add("hidden");
  usersTabBtn.classList.add("border-b-2", "border-primary", "text-primary");
  addUserTabBtn.classList.remove(
    "border-b-2",
    "border-primary",
    "text-primary"
  );
  addUserTabBtn.classList.add("text-gray-500");
  fetchUsers();
});

addUserTabBtn.addEventListener("click", () => {
  usersTab.classList.add("hidden");
  addUserTab.classList.remove("hidden");
  addUserTabBtn.classList.add("border-b-2", "border-primary", "text-primary");
  usersTabBtn.classList.remove("border-b-2", "border-primary", "text-primary");
  usersTabBtn.classList.add("text-gray-500");
});

function formatPhoneNumber(phone) {
  // Remove caracteres não numéricos
  const cleaned = ("" + phone).replace(/\D/g, "");

  // Verifica se o número tem exatamente 11 dígitos
  if (cleaned.length === 11) {
    // Verifica se o código de área é 86
    if (cleaned.startsWith("86")) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    } else {
      return "Número inválido: deve começar com 86";
    }
  }

  return "Número inválido: deve ter 11 dígitos"; // Retorna mensagem de erro se não corresponder ao formato
}

// Deletar usuário
window.deleteUser = async (userId) => {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) {
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/usuarios/${userId}`);
    alert("Usuário excluído com sucesso!");
    fetchUsers(); // Atualiza a lista de usuários após exclusão
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    alert("Erro ao excluir usuário");
  }
};

// Fetch all users
async function fetchUsers(searchTerm = "") {
  try {
    usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center">
                            <div class="animate-pulse flex flex-col space-y-2">
                                <div class="h-4 bg-gray-200 rounded"></div>
                                <div class="h-4 bg-gray-200 rounded"></div>
                                <div class="h-4 bg-gray-200 rounded"></div>
                            </div>
                        </td>
                    </tr>
                `;

    const response = await axios.get(`${API_BASE_URL}/usuarios`);
    const users = response.data.filter(
      (user) =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefone.includes(searchTerm)
    );

    renderUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Erro ao carregar usuários");
  }
}

// Render users table
function renderUsers(users) {
  if (users.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-gray-500">
          Nenhum usuário encontrado
        </td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = users
    .map(user => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.id}</td>
        <td class="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
        <img 
          src="https://api-gerenciador-qqy9.onrender.com${user.fotoUrl.replace('.jpg', '.png')}" 
          alt="Foto de ${user.nome}" 
          class="w-10 h-10 rounded-full object-cover"
          onerror="this.onerror=null;this.src='https://api-gerenciador-qqy9.onrender.com/perfis/default.png';"/>
          <div class="text-sm font-medium text-gray-900">${user.nome}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPhoneNumber(user.telefone)}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }">${user.status ? "Ativo" : "Inativo"}</span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
          <button onclick="openEditUserModal(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
          <button onclick="toggleUserStatus(${user.id}, ${user.status})" class="${
            user.status ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
          }">${user.status ? "Desativar" : "Ativar"}</button>
          <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900 ml-3">Excluir</button>
        </td>
      </tr>
    `).join("");
}


// Add new user
addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    nome: addUserForm.name.value,
    telefone: addUserForm.phone.value,
    senha: addUserForm.password.value,
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/usuarios`, userData);
    alert("Usuário cadastrado com sucesso!");
    addUserForm.reset();
    fetchUsers();
    usersTabBtn.click();
  } catch (error) {
    console.error("Error adding user:", error);
    alert(error.response?.data?.error || "Erro ao cadastrar usuário");
  }
});

// Cancel add user
cancelAddUserBtn.addEventListener("click", () => {
  addUserForm.reset();
  usersTabBtn.click();
});

// Open edit modal
window.openEditUserModal = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios`);
    const user = response.data.find((u) => u.id === userId);

    if (!user) {
      alert("Usuário não encontrado");
      return;
    }

    document.getElementById("editUserId").value = user.id;
    document.getElementById("editName").value = user.nome;
    document.getElementById("editPhone").value = user.telefone;
    document.getElementById("editStatus").value = user.status;

    editUserModal.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching user:", error);
    alert("Erro ao carregar usuário");
  }
};

// Submit edit form
editUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userId = editUserForm.editUserId.value;
  const userData = {
    nome: editUserForm.editName.value,
    telefone: editUserForm.editPhone.value,
    status: editUserForm.editStatus.value,
    senha: editUserForm.editPassword.value || undefined,
  };

  try {
    await axios.put(`${API_BASE_URL}/usuarios/${userId}/status`, {
      status: userData.status,
    });

    if (userData.senha) {
      await axios.put(`${API_BASE_URL}/usuarios/${userId}`, {
        nome: userData.nome,
        telefone: userData.telefone,
        senha: userData.senha,
      });
    } else {
      await axios.put(`${API_BASE_URL}/usuarios/${userId}`, {
        nome: userData.nome,
        telefone: userData.telefone,
      });
    }

    alert("Usuário atualizado com sucesso!");
    editUserModal.classList.add("hidden");
    fetchUsers();
  } catch (error) {
    console.error("Error updating user:", error);
    alert(error.response?.data?.error || "Erro ao atualizar usuário");
  }
});

// Close edit modal
closeEditModalBtn.addEventListener("click", () => {
  editUserModal.classList.add("hidden");
});

cancelEditBtn.addEventListener("click", () => {
  editUserModal.classList.add("hidden");
});

// Toggle user status
window.toggleUserStatus = async (userId, currentStatus) => {
  if (
    !confirm(
      `Tem certeza que deseja ${
        currentStatus ? "desativar" : "ativar"
      } este usuário?`
    )
  ) {
    return;
  }

  try {
    const newStatus = currentStatus ? 0 : 1;
    await axios.patch(`${API_BASE_URL}/usuarios/${userId}/status`, {
      status: newStatus,
    });
    fetchUsers();
  } catch (error) {
    console.error("Error toggling user status:", error);
    alert("Erro ao alterar status do usuário");
  }
};

// Search users
searchInput.addEventListener("input", (e) => {
  fetchUsers(e.target.value);
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
});

document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    // Avatar
    const avatarId = document.getElementById("avatarId");
    const avatarNome = document.getElementById("avatarNome");
    const avatarTelefone = document.getElementById("avatarTelefone");
    const avatarStatus = document.getElementById("avatarStatus");
    const avatarInicial = document.getElementById("avatarInicial");
    const avatarImagem = document.getElementById("avatarImagem");

    if (
      avatarId &&
      avatarNome &&
      avatarTelefone &&
      avatarStatus &&
      avatarInicial
    ) {
      avatarId.textContent = usuario.id;
      avatarNome.textContent = usuario.nome;
      avatarTelefone.textContent = formatPhoneNumber(usuario.telefone);
      avatarStatus.textContent = usuario.status ? "Ativo" : "Inativo";
      avatarInicial.textContent = usuario.nome?.charAt(0).toUpperCase() || "U";
    }

    // Carrega imagem do perfil
    if (avatarImagem) {
      avatarImagem.src = `https://api-gerenciador-qqy9.onrender.com/perfis/${usuario.id}.png`;

      avatarImagem.onload = () => {
        avatarImagem.classList.remove("hidden");
        avatarInicial.classList.add("hidden");
      };

      avatarImagem.onerror = () => {
        avatarImagem.classList.add("hidden");
        avatarInicial.textContent = usuario.nome?.charAt(0).toUpperCase() || "U";
        avatarInicial.classList.remove("hidden");
      };
    }

    // Logout
    const logoutBtn = document.getElementById("avatarLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index";
      });
    }
  }

  const avatarBtn = document.getElementById("avatarBtn");
  const avatarMenu = document.getElementById("avatarMenu");
  const avatarContainer = document.getElementById("avatarContainer");

  let avatarMenuFixed = false;

  if (avatarBtn && avatarMenu && avatarContainer) {
    // Clique: fixa ou solta o menu
    avatarBtn.addEventListener("click", () => {
      avatarMenuFixed = !avatarMenuFixed;
      if (avatarMenuFixed) {
        avatarMenu.classList.remove("hidden");
      } else {
        avatarMenu.classList.add("hidden");
      }
    });

    // Clicar fora: fecha se estava fixo
    document.addEventListener("click", (event) => {
      if (avatarMenuFixed && !avatarContainer.contains(event.target)) {
        avatarMenuFixed = false;
        avatarMenu.classList.add("hidden");
      }
    });

    // Hover: só mostra se não estiver fixo
    avatarContainer.addEventListener("mouseenter", () => {
      if (!avatarMenuFixed) avatarMenu.classList.remove("hidden");
    });

    avatarContainer.addEventListener("mouseleave", () => {
      if (!avatarMenuFixed) avatarMenu.classList.add("hidden");
    });
  }
});


// Função para formatar telefone
function formatPhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
}
