function toFirstPage() {
    $(document.body).empty();
    $(document.body).append(get_banner());
    $(document.body).append(
        $(`
        <a href="https://vote.pollnextdoor.com" style="position:absolute;top:30%;left:40%" target="_blank" title="投票網站">投票網站</a>
        <a href="https://tetr.pollnextdoor.com" style="position:absolute;top:40%;left:40%"target="_blank" title="Tetr-2P Battle網站">Tetr-2P Battle網站</a>
        `)
    );
}
