function parseAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function isUserAdmin(prisma, user) {
  if (!user) return false;

  const adminEmails = parseAdminEmails();
  if (adminEmails.length > 0) {
    return adminEmails.includes((user.email || '').toLowerCase());
  }

  const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  return !!firstUser && firstUser.id === user.id;
}

module.exports = {
  isUserAdmin,
};
