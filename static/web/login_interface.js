function toFirstPage() {
    $(document.body).empty();
    $(document.body).append(get_banner());
    $(document.body).append(
        $(`
        <a href="https://vote.kchoen.com" style="position:absolute;top:30%;left:40%" target="_blank" title="投票網站">投票網站</a>
        <a href="https://tetr.kchoen.com" style="position:absolute;top:40%;left:40%"target="_blank" title="Tetr-2P Battle網站">Tetr-2P Battle網站</a>
        <a href="https://file.kchoen.com" style="position:absolute;top:50%;left:40%"target="_blank" title="檔案及布告欄">檔案/布告欄</a>
        `)
    );
}