declare var lazySizesConfig: {
    lazyClass?: string,
    loadedClass?: string,
    loadingClass?: string,
    preloadClass?: string,
    errorClass?: string,
    //strictClass?: 'lazystrict',
    autosizesClass?: string,
    srcAttr?: string,
    srcsetAttr?: string,
    sizesAttr?: string,
    //preloadAfterLoad?: false,
    minSize?: number,
    customMedia?: {},
    init?: boolean,
    expand?: number,
    expFactor?: number,
    hFac?: number,
    loadMode?: number,
    loadHidden?: boolean,
    ricTimeout?: number,
    throttleDelay?: number,
};

declare module 'lazysizes' {

    class lazysizes {
        static init(): void;
    }

    export = lazysizes;
}
