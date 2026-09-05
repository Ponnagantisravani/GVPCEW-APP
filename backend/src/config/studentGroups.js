export const studentGroups = [
  ['Computer Science Engineering', ['1', '2', '3', '4']],
  ['CSE - Artificial Intelligence & ML', ['1', '2']],
  ['CSE - Cyber Security', ['1']],
  ['Electronics & Communication Engineering', ['1', '2']],
  ['Electrical & Electronics Engineering', ['1']],
  ['Information Technology', ['1']]
].flatMap(([department, sections]) => sections.map(section => ({ department, section })));
