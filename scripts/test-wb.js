function wb(str) {
  const escaped = str.replace(/[.*+?^${}()|[\]\]/g, '\$&');
  return new RegExp('\b' + escaped + '\b', 'gi');
}
console.log('crusade:', 'crusade'.replace(wb('rusa'), 'Russian'));
console.log('Jerusalem:', 'Jerusalem'.replace(wb('rusa'), 'Russian'));
console.log('the rusa:', 'the rusa test'.replace(wb('rusa'), 'Russian'));
console.log('dominion:', 'dominion'.replace(wb('dominio'), 'dominion'));
console.log('cruzada:', 'cruzada'.replace(wb('rusa'), 'Russian'));
