export function getAislePositions(colCount: number, minSide = 2, forceEven = false): number[] {
    // 两边数量为总列数1/5，最小为2
    let side = Math.floor(colCount / 5);
    if (side < minSide) side = minSide;
    // 情侣厅强制偶数
    if (forceEven && side % 2 !== 0) side++;
    // 如果两边数量太大导致中间区太小，自动减少两边
    while ((colCount - side * 2) < 2 && side > minSide) {
        side -= forceEven ? 2 : 1;
    }
    // 返回分割点
    return [side, colCount - side];
}