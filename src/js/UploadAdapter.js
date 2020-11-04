import { bytesToSize } from "./utils.js";

export default class UploadAdapter {
  constructor( loader, vm ) {
    this.loader = loader;
    this.maxsize = 600 * 1024;
    this.vm = vm;
  }

  upload() {
    return this.loader.file
    .then( file => new Promise( ( resolve, reject ) => {
      this._initRequest();
      this._initListeners( resolve, reject, file );
      this._sendRequest( file );
    } ) );
  }

  abort() {
    if ( this.xhr ) {
      this.xhr.abort();
    }
  }

  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    xhr.open( 'POST', '/rest/media', true );
    xhr.responseType = 'text';
  }

  _initListeners( resolve, reject, file ) {

    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${ file.name }.`;

    xhr.addEventListener( 'error', (err) => {
      console.log('error', err);
      reject( genericErrorText )
    });

    xhr.addEventListener( 'abort', () => reject() );

    xhr.addEventListener( 'load', (res) => {

      const response = xhr.response;

      if( xhr.status !== 200 || !response) {

        var err = null;

        try {

          err = JSON.parse(xhr.response);

          this.vm.$toast.open({
            type: 'error',
            message: err && err.message ? err.message : "Falha no upload da imagem, tente novamente."
          });

        } catch (err) {
          console.error(err);
        }

        return reject();

      }

      resolve({
        default: response
      });

    } );

    if ( xhr.upload ) {
      xhr.upload.addEventListener( 'progress', evt => {
        if ( evt.lengthComputable ) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      } );
    }
  }

  _sendRequest( file ) {
    const data = new FormData();


    data.append( 'file', file );
    this.xhr.send( data );
  }
}
